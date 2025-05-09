import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository} from 'typeorm';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'

import { TeacherEntity, StudentEntity,TeacherAttendanceEntity,TeacherClassScheduleEntity, StudentAttendanceEntity,StudentClassScheduleEntity } from 'src/entities/person.entity';
import { CalendarEventEntity,  CalendarEventStudentEntity, CalendarEventTeacherEntity , ClassCancellationEntity} from '../../entities/calendar/calendar.entity';
import { CalendarEventDescriptionEntity } from '../../entities/calendar/calendar-description.entity'
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { withRetry } from '../../common/utils/retry.util';
import { EventQueryDto, EventQueryPeriod } from './dto/event-query.dto';
import { EventResponseDto, EventDetailResponseDto } from './dto/event-response.dto';

import { EventType } from '../../libs/interface/calendar.interface';


@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly maxAttempts: number;
  private readonly retryDelay: number;

  constructor(
    @InjectRepository(CalendarEventEntity)
    private eventRepository: Repository<CalendarEventEntity>,
    @InjectRepository(CalendarEventTeacherEntity)
    private eventTeacherRepository: Repository<CalendarEventTeacherEntity>,
    @InjectRepository(CalendarEventStudentEntity)
    private eventStudentRepository: Repository<CalendarEventStudentEntity>,
    @InjectRepository(TeacherEntity)
    private readonly teacherRepository: Repository<TeacherEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(TeacherClassScheduleEntity)
    private teacherScheduleRepository: Repository<TeacherClassScheduleEntity>,
    @InjectRepository(StudentClassScheduleEntity)
    private studentScheduleRepository: Repository<StudentClassScheduleEntity>,
    @InjectRepository(CalendarEventTeacherEntity)
    private calendarEventTeacherRepository: Repository<CalendarEventTeacherEntity>,
    @InjectRepository(CalendarEventStudentEntity)
    private calendarEventStudentRepository: Repository<CalendarEventStudentEntity>,
    @InjectRepository(StudentAttendanceEntity)
    private studentAttendanceRepository: Repository<StudentAttendanceEntity>,
    @InjectRepository(TeacherAttendanceEntity)
    private teacherAttendanceRepository: Repository<TeacherAttendanceEntity>,
    @InjectRepository(ClassCancellationEntity)
    private classCancellationRepository: Repository<ClassCancellationEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {
    this.maxAttempts = this.configService.get<number>('retry.maxAttempts') ?? 5;
    this.retryDelay = this.configService.get<number>('retry.delay') ?? 500;
  }

  async createEvent(createEventDto: CreateEventDto): Promise<{ success: boolean }> {
    return await withRetry(
      async () => {
        const now = new Date();

        const queryRunner = this.eventRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const calendarEventDescription = new CalendarEventDescriptionEntity();
          calendarEventDescription.description = createEventDto.description;

          const event = this.eventRepository.create({
            event_type: createEventDto.event_type,
            event_date: createEventDto.event_date,
            class_type: createEventDto.event_type === EventType.CLASS ? createEventDto.class_type : undefined,
            is_recurring: createEventDto.is_recurring,
            recurrence_pattern: createEventDto.recurrence_pattern,
            description: calendarEventDescription,
            created_at : now,
            updated_at : now
          });

          const savedEvent = await queryRunner.manager.save(event);

          if (createEventDto.teacher_ids?.length) {
            const teacherEvents = createEventDto.teacher_ids.map(teacherId => ({
              event_id: savedEvent.id,
              teacher_id: teacherId
            }));
            await queryRunner.manager.save(CalendarEventTeacherEntity, teacherEvents);
          }

          if (createEventDto.event_type === EventType.CLASS && createEventDto.student_ids?.length) {
            const studentEvents = createEventDto.student_ids.map(studentId => ({
              event_id: savedEvent.id,
              student_id: studentId
            }));
            await queryRunner.manager.save(CalendarEventStudentEntity, studentEvents);
          }

          await queryRunner.commitTransaction();
          await this.invalidateDailyCache(event.event_date);
          return { success: true };
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'createEvent'
    );
  }

  async createBulkEvents(events: CreateEventDto[]): Promise<{ success: boolean; createdCount: number; errorDetails?: string[] }> {
    return await withRetry(
      async () => {
        const queryRunner = this.eventRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const createdEvents: CalendarEventEntity[] = [];
        const errorDetails: string[] = [];

        try {
          for (const eventDto of events) {
            try {
              const event = new CalendarEventEntity();
              event.event_type = eventDto.event_type;
              event.event_date = eventDto.event_date;
              event.class_type = eventDto.event_type === EventType.CLASS ? eventDto.class_type : undefined;
              event.is_recurring = eventDto.is_recurring;
              event.recurrence_pattern = eventDto.recurrence_pattern;

              const description = new CalendarEventDescriptionEntity();
              description.description = eventDto.description;
              event.description = description;

              const savedEvent = await queryRunner.manager.save(event);

              if (eventDto.teacher_ids?.length) {
                const teacherEvents = eventDto.teacher_ids.map(teacherId => ({
                  event_id: savedEvent.id,
                  teacher_id: teacherId
                }));
                await queryRunner.manager.save(CalendarEventTeacherEntity, teacherEvents);
              }

              if (eventDto.event_type === EventType.CLASS && eventDto.student_ids?.length) {
                const studentEvents = eventDto.student_ids.map(studentId => ({
                  event_id: savedEvent.id,
                  student_id: studentId
                }));
                await queryRunner.manager.save(CalendarEventStudentEntity, studentEvents);
              }

              createdEvents.push(savedEvent);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : 'unknown error';
              errorDetails.push(`Failed for event on ${eventDto.event_date}: ${errorMsg}`);
            }
          }

          if (errorDetails.length === 0) {
            await queryRunner.commitTransaction();
            
            const uniqueDates = new Set(createdEvents.map(event => format(event.event_date, 'yyyy-MM-dd')));
            await Promise.all([...uniqueDates].map(date => this.invalidateEventCaches(new Date(date))));
            
            return { success: true, createdCount: createdEvents.length };
          } else {
            await queryRunner.rollbackTransaction();
            return { 
              success: false, 
              createdCount: 0, 
              errorDetails 
            };
          }
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'createBulkEvents'
    );
  }
        

  async getSingleEvent(id: number): Promise<EventResponseDto> {
    const cacheKey = `event:${id}`;
    const cachedEvent = await this.cacheManager.get<CalendarEventEntity>(cacheKey);
    if (cachedEvent) {
      this.logger.debug(`Cache hit for event ${id}`);
      return plainToInstance(EventResponseDto, cachedEvent);
    }
  
    const event = await withRetry(
      async () => {
        return await this.eventRepository.findOne({ where: { id } });
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'getSingleEvent'
    );
  
    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found.`);
    }
  
    await this.cacheManager.set(cacheKey, event);
    return plainToInstance(EventResponseDto, event);
  }

  async getEventsByPeriod(queryDto: EventQueryDto): Promise<EventResponseDto[]> {
    const { startDate, endDate } = this.calculateDateRange(queryDto);
    const cacheKey = `events:${format(startDate, 'yyyy-MM-dd')}:${format(endDate, 'yyyy-MM-dd')}`;
    
    let events = await this.cacheManager.get<EventResponseDto[]>(cacheKey);
    if (events) {
      this.logger.debug(`Cache hit for period ${startDate} to ${endDate}`);
      return events;
    }

    events = await withRetry(
      async () => {
        const events = await this.eventRepository
          .createQueryBuilder('event')
          .leftJoinAndSelect('event.description', 'description')
          .leftJoinAndSelect('event.teachers', 'teachers')
          .leftJoinAndSelect('teachers.teacher', 'teacher')
          .leftJoinAndSelect('event.students', 'students')
          .leftJoinAndSelect('students.student', 'student')
          .where('event.event_date BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          })
          .orderBy('event.event_date', 'ASC')
          .getMany();

        await Promise.all(
          events.map(event => 
            this.cacheManager.set(`event:${event.id}`, event, 60 * 60 * 24)
          )
        );

        return events;
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'getEventsByPeriod'
    );

    await this.cacheManager.set(cacheKey, events, 60 * 60);
    return plainToInstance(EventResponseDto, events);
  }

  async getEventDetail(id: number): Promise<EventDetailResponseDto | null> {
    const cacheKey = `eventDetail:${id}`;
    const cachedEvent = await this.cacheManager.get<CalendarEventEntity>(cacheKey);
    if (cachedEvent) {
      this.logger.debug(`Cache hit for event detail with id ${id}`);
      return plainToInstance(EventDetailResponseDto, cachedEvent);
    }

    return await withRetry(
      async () => {
        const event = await this.eventRepository
          .createQueryBuilder('event')
          .leftJoinAndSelect('event.description', 'description')
          .leftJoinAndSelect('event.teachers', 'teachers')
          .leftJoinAndSelect('teachers.teacher', 'teacher')
          .leftJoinAndSelect('event.students', 'students')
          .leftJoinAndSelect('students.student', 'student')
          .where('event.id = :id', { id })
          .getOne();

        if (!event) {
          return null;
        }

        await this.cacheManager.set(cacheKey, event, 60 * 60 * 24);
        return plainToInstance(EventDetailResponseDto, event);
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'getEventDetail'
    );
  }

  async updateEvent(id: number, updateEventDto: UpdateEventDto): Promise<{ success: boolean }> {
    return await withRetry(
      async () => {
        const queryRunner = this.eventRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const event = await this.eventRepository.findOne({ where: { id } });
          if (!event) {
            throw new NotFoundException(`Event with id ${id} not found.`);
          }

          Object.assign(event, {
            ...updateEventDto,
            class_type: updateEventDto.event_type === EventType.CLASS ? updateEventDto.class_type : undefined,
            updated_at : new Date()
          });

          await queryRunner.manager.save(event);

          if (updateEventDto.teacher_ids) {
            await queryRunner.manager.delete(CalendarEventTeacherEntity, { event_id: id });
            const teacherEvents = updateEventDto.teacher_ids.map(teacherId => ({
              event_id: id,
              teacher_id: teacherId
            }));
            await queryRunner.manager.save(CalendarEventTeacherEntity, teacherEvents);
          }

          if (event.event_type === EventType.CLASS && updateEventDto.student_ids) {
            await queryRunner.manager.delete(CalendarEventStudentEntity, { event_id: id });
            const studentEvents = updateEventDto.student_ids.map(studentId => ({
              event_id: id,
              student_id: studentId
            }));
            await queryRunner.manager.save(CalendarEventStudentEntity, studentEvents);
          }

          await queryRunner.commitTransaction();
          await this.invalidateDailyCache(event.event_date);
          return { success: true };
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw error;
        } finally {
          await queryRunner.release();
        }
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'updateEvent'
    );
  }

  async deleteEvent(id: number): Promise<{ success: boolean }> {
    return await withRetry(
      async () => {
        const event = await this.eventRepository.findOne({where : {id}});
        if (!event){
            throw new NotFoundException(`Delete Target Event not found : ${id}`)
        }
        await this.teacherAttendanceRepository.delete({ event: { id } });
    
        await this.studentAttendanceRepository.delete({ event: { id }});
        
        await this.calendarEventTeacherRepository.delete({ event_id: id });
        
        await this.calendarEventStudentRepository.delete({ event_id: id });
        
        await this.classCancellationRepository.delete(id);
        await this.eventRepository.delete(id);
        await this.invalidateDailyCache(event.event_date);
        return { success: true };
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'deleteEvent'
    );
  }

  private calculateDateRange(queryDto: EventQueryDto): { startDate: Date; endDate: Date } {
    const today = new Date();
    
    switch (queryDto.period) {
      case EventQueryPeriod.THREE_MONTHS: {
        const currentMonth = today.getMonth();
        return {
          startDate: new Date(today.getFullYear(), currentMonth - 1, 1),
          endDate: new Date(today.getFullYear(), currentMonth + 2, 0)
        };
      }
      case EventQueryPeriod.ONE_MONTH: {
        return {
          startDate: startOfMonth(today),
          endDate: endOfMonth(today)
        };
      }
      case EventQueryPeriod.ONE_WEEK: {
        const dayOfWeek = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + (6 - dayOfWeek));
        return { startDate, endDate };
      }
      case EventQueryPeriod.ONE_DAY: {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        return { startDate: date, endDate: date };
      }
      default:
        throw new Error('Unsupported period');
    }
  }

  // 캐싱 구조 하루 단위로 하면 안될 것 같은데
  // 이벤트 단위 캐싱을 하고 메타 캐싱으로 묶어서 하는게 좋지 않을까
  private async invalidateDailyCache(eventDate: Date): Promise<void> {
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    const cacheKey = `events:${dateKey}`;
    await this.cacheManager.del(cacheKey);
    this.logger.debug(`Daily cache invalidated for date: ${dateKey}`);
  }
  
  private async invalidateMonthCache(eventDate: Date): Promise<void> {
    const firstDay = startOfMonth(eventDate);
    const lastDay = endOfMonth(eventDate);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
  
    for (const day of days) {
      const dateKey = format(day, 'yyyy-MM-dd'); // "YYYY-MM-DD" 형식의 날짜 문자열
      const cacheKey = `events:${dateKey}`;
      await this.cacheManager.del(cacheKey);
      this.logger.debug(`Monthly cache invalidated for date: ${dateKey}`);
    }
  }
  
  private async invalidateRangeCache(eventDate: Date): Promise<void> {
    for (let offset = -1; offset <= 1; offset++) {
      const targetDate = new Date(eventDate.getFullYear(), eventDate.getMonth() + offset, 1);
      await this.invalidateMonthCache(targetDate);
    }
  }
  
  public async invalidateEventCaches(eventDate: Date): Promise<void> {
    await this.invalidateDailyCache(eventDate);
    await this.invalidateMonthCache(eventDate);
    await this.invalidateRangeCache(eventDate);
    this.logger.debug(`All caches invalidated for event date: ${eventDate.toISOString()}`);
  }

}