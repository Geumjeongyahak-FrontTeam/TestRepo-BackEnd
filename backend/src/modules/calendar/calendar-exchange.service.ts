import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { CalendarEventEntity, CalendarEventTeacherEntity } from '../../entities/calendar/calendar.entity';
import { ExchangeClassDto } from './dto/exchange-class.dto';
import { withRetry } from 'src/common/utils/retry.util';
import { EventType } from '../../libs/interface/calendar.interface';


enum ConflictType {
    SCHEDULE = 'SCHEDULE',
    CLASS_TYPE = 'CLASS_TYPE',
    OTHER = 'OTHER'
  }

interface ExchangeConflict {
  conflict_type: ConflictType;
  details: string;
}
  
@Injectable()
export class CalendarExchangeService {
  private readonly logger = new Logger(CalendarExchangeService.name);
  private readonly maxAttempts: number = 3;
  private readonly retryDelay: number = 1000;

  constructor(
    @InjectRepository(CalendarEventEntity)
    private readonly eventRepository: Repository<CalendarEventEntity>,
    @InjectRepository(CalendarEventTeacherEntity)
    private readonly eventTeacherRepository: Repository<CalendarEventTeacherEntity>,
    private readonly connection: Connection,
  ) {}

  async swapTeachers(swapDto: ExchangeClassDto): Promise<{ success: boolean }> {
    return await withRetry(
      async () => {
        const { event_id1, teacher_id1, event_id2, teacher_id2 } = swapDto;

        const [event1, event2] = await Promise.all([
          this.eventRepository.findOne({
            where: { id: event_id1 },
            relations: ['description']
          }),
          this.eventRepository.findOne({
            where: { id: event_id2 },
            relations: ['description']
          })
        ]);

        if (!event1 || !event2) {
          throw new NotFoundException('One or both events not found');
        }

        if (event1.event_type !== EventType.CLASS || event2.event_type !== EventType.CLASS) {
          throw new BadRequestException('Teacher exchange is only possible for class events');
        }

        const [teacherAssignment1, teacherAssignment2] = await Promise.all([
          this.eventTeacherRepository.findOne({
            where: {
              event_id: event_id1,
              teacher_id: teacher_id1
            }
          }),
          this.eventTeacherRepository.findOne({
            where: {
              event_id: event_id2,
              teacher_id: teacher_id2
            }
          })
        ]);

        if (!teacherAssignment1 || !teacherAssignment2) {
          throw new BadRequestException('Teacher assignments do not match the events');
        }

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const now = new Date();
        
          teacherAssignment1.teacher_id = teacher_id2;
          teacherAssignment2.teacher_id = teacher_id1;

          // Update Event
          event1.updated_at = now;
          event2.updated_at = now;

          await Promise.all([
            queryRunner.manager.save(teacherAssignment1),
            queryRunner.manager.save(teacherAssignment2),
            queryRunner.manager.save(event1),
            queryRunner.manager.save(event2)
          ]);

          // Optional 
          if (event1.description && event2.description) {
            event1.description.description += `\n[Teacher Exchange] Swapped with event ${event_id2}`;
            event2.description.description += `\n[Teacher Exchange] Swapped with event ${event_id1}`;
            
            await Promise.all([
              queryRunner.manager.save(event1.description),
              queryRunner.manager.save(event2.description)
            ]);
          }

          await queryRunner.commitTransaction();

          this.logger.log(`Successfully swapped teachers between events ${event_id1} and ${event_id2}`);
          return { success: true };
        } catch (error) {
          await queryRunner.rollbackTransaction();
          if (error instanceof Error){
              this.logger.error(`Failed to swap teachers: ${error.message}`);
          }
          throw error;
        } finally {
          await queryRunner.release();
        }
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'swapTeachers'
    );
  }


  async validateTeacherExchange(swapDto: ExchangeClassDto): Promise<{ 
    valid: boolean; 
    conflicts?: ExchangeConflict[];
  }> {
    const { event_id1, teacher_id1, event_id2, teacher_id2 } = swapDto;

    const events = await this.eventRepository.find({
      where: [{ id: event_id1 }, { id: event_id2 }],
      relations: ['teachers', 'teachers.teacher']
    });

    const conflicts = [];

    if (events.length !== 2) {
      return {
        valid: false,
        conflicts: [{
          conflict_type: ConflictType.OTHER,
          details: 'One or both events not found'
        }]
      };
    }

    for (const event of events) {
      if (event.event_type !== EventType.CLASS) {
        conflicts.push({
          conflict_type: ConflictType.CLASS_TYPE,
          details: 'Event is not a class event'
        });
        continue;
      }

      const targetTeacherId = event.id === event_id1 ? teacher_id2 : teacher_id1;
      const hasScheduleConflict = await this.checkTeacherScheduleConflict(
        targetTeacherId,
        event.event_date,
        event.id
      );

      if (hasScheduleConflict) {
        conflicts.push({
          conflict_type: ConflictType.SCHEDULE,
          details: `Teacher has conflicting schedule on ${event.event_date}`
        });
      }
    }

    return {
      valid: conflicts.length === 0,
      conflicts: conflicts.length > 0 ? conflicts : undefined
    };
  }

  private async checkTeacherScheduleConflict(
    teacherId: number,
    date: Date,
    excludeEventId: number
  ): Promise<boolean> {
    const existingEvents = await this.eventRepository
      .createQueryBuilder('event')
      .innerJoin('event.teachers', 'teacher')
      .where('teacher.teacher_id = :teacherId', { teacherId })
      .andWhere('event.event_date = :date', { date })
      .andWhere('event.id != :excludeEventId', { excludeEventId })
      .getCount();

    return existingEvents > 0;
  }
}