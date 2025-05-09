import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { CalendarEventEntity, ClassCancellationEntity, ClassCancellationTeacherEntity } from '../../entities/calendar/calendar.entity';
import { StudentAttendanceEntity, TeacherAttendanceEntity } from '../../entities/person.entity';
import { CancelClassDto } from './dto/cancellation-class.dto';
import { EventType } from '../../libs/interface/calendar.interface';
import { AttendanceStatus } from '../../libs/interface/shared/class.interface';
import { withRetry } from '../../common/utils/retry.util';

@Injectable()
export class CalendarCancellationService {
  private readonly logger = new Logger(CalendarCancellationService.name);
  private readonly maxAttempts: number = 3;
  private readonly retryDelay: number = 1000;

  constructor(
    @InjectRepository(CalendarEventEntity)
    private readonly eventRepository: Repository<CalendarEventEntity>,
    @InjectRepository(ClassCancellationEntity)
    private readonly cancellationRepository: Repository<ClassCancellationEntity>,
    @InjectRepository(StudentAttendanceEntity)
    private readonly studentAttendanceRepository: Repository<StudentAttendanceEntity>,
    @InjectRepository(TeacherAttendanceEntity)
    private readonly teacherAttendanceRepository: Repository<TeacherAttendanceEntity>,
    private readonly connection: Connection,
  ) {}

  async cancelClass(cancelDto: CancelClassDto): Promise<{ success: boolean }> {
    return await withRetry(
      async () => {
        const { event_id, teacher_id, cancellation_reason } = cancelDto;

        const event = await this.eventRepository.findOne({
          where: { id: event_id },
          relations: ['teachers']
        });

        if (!event) {
          throw new NotFoundException(`Could not find Event: ${event_id}`);
        }

        if (event.event_type !== EventType.CLASS) {
          throw new BadRequestException(`Event ${event_id} is not a class event`);
        }

        const isTeacherAuthorized = event.teachers.some(t => t.teacher_id === teacher_id);
        if (!isTeacherAuthorized) {
          throw new BadRequestException(`Teacher ${teacher_id} is not authorized for this class`);
        }

        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const cancellation = new ClassCancellationEntity();
          cancellation.event = event;
          cancellation.id = teacher_id; // cancellation.teacher_id -> cancellation.id
          cancellation.cancellation_reason = cancellation_reason;

          const teacherAttendance = new TeacherAttendanceEntity();
          teacherAttendance.teacher_id = teacher_id;
          teacherAttendance.event = event;
          teacherAttendance.status = AttendanceStatus.CANCELLED;
          teacherAttendance.event_type = EventType.CLASS;

          const existingStudentAttendances = await this.studentAttendanceRepository.find({
            where: { event: { id: event_id } }
          });

          const updatedStudentAttendances = existingStudentAttendances.map(attendance => ({
            ...attendance,
            status: AttendanceStatus.CANCELLED
          }));

          await Promise.all([
            queryRunner.manager.save(cancellation),
            queryRunner.manager.save(teacherAttendance),
            updatedStudentAttendances.length > 0 && 
              queryRunner.manager.save(StudentAttendanceEntity, updatedStudentAttendances)
          ].filter(Boolean));

          await queryRunner.commitTransaction();
          
          this.logger.log(`Class ${event_id} has been cancelled by teacher ${teacher_id}`);
          return { success: true };
        } catch (error) {
          await queryRunner.rollbackTransaction();
          if (error instanceof Error){
              this.logger.error(`Failed to cancel class: ${error.message}`);
          }
          throw error;
        } finally {
          await queryRunner.release();
        }
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'cancelClass'
    );
  }

  async getCancellationHistory(event_id: number): Promise<ClassCancellationEntity[]> {
    return await withRetry(
      async () => {
        const cancellations = await this.cancellationRepository.find({
          where: { event: { id: event_id } },
          relations: ['event'],
          order: { cancelled_at: 'DESC' }
        });

        if (!cancellations.length) {
          this.logger.debug(`No cancellation history found for event ${event_id}`);
        }

        return cancellations;
      },
      this.maxAttempts,
      this.retryDelay,
      this.logger,
      'getCancellationHistory'
    );
  }

  async validateCancellation(event_id: number, teacher_id: number): Promise<{
    canCancel: boolean;
    reason?: string;
  }> {
    const event = await this.eventRepository.findOne({
      where: { id: event_id },
      relations: ['teachers']
    });

    if (!event) {
      return { canCancel: false, reason: 'Event not found' };
    }

    if (event.event_type !== EventType.CLASS) {
      return { canCancel: false, reason: 'Event is not a class' };
    }

    const isTeacherAuthorized = event.teachers.some(t => t.teacher_id === teacher_id);
    if (!isTeacherAuthorized) {
      return { canCancel: false, reason: 'Teacher is not authorized for this class' };
    }

    // 이미 취소된 수업인지 확인
    const existingCancellation = await this.cancellationRepository.findOne({
      where: { event: { id: event_id } }
    });

    if (existingCancellation) {
      return { canCancel: false, reason: 'Class is already cancelled' };
    }

    return { canCancel: true };
  }
}