import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { CalendarController } from './calendar.controller';

// Services
import { CalendarService } from './calendar.service';
import { CalendarExchangeService } from './calendar-exchange.service';
import { CalendarCancellationService } from './calendar-cancellation.service';
import { DatabaseInitializerService } from './database-initialize.service';

// Entities
import { 
  CalendarEventEntity, 
  CalendarEventTeacherEntity,
  CalendarEventStudentEntity,
  ClassCancellationEntity
} from '../../entities/calendar/calendar.entity';
import {
  CalendarEventDescriptionEntity
} from '../../entities/calendar/calendar-description.entity'
import { 
  TeacherEntity,
  StudentEntity,
  TeacherClassScheduleEntity,
  StudentClassScheduleEntity,
  TeacherAttendanceEntity,
  StudentAttendanceEntity
} from '../../entities/person.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Calendar entities
      CalendarEventEntity,
      CalendarEventDescriptionEntity,
      CalendarEventTeacherEntity,
      CalendarEventStudentEntity,
      ClassCancellationEntity,
      
      
      // Person entities
      TeacherEntity,
      StudentEntity,
      TeacherClassScheduleEntity,
      StudentClassScheduleEntity,
      TeacherAttendanceEntity,
      StudentAttendanceEntity,
      
    ]),
  ],
  controllers: [
    CalendarController,
  ],
  providers: [
    CalendarService,
    CalendarExchangeService,
    CalendarCancellationService,
    DatabaseInitializerService,
  ],
  exports: [
    CalendarService,
    CalendarExchangeService,
    CalendarCancellationService,
    DatabaseInitializerService,
  ],
})
export class CalendarModule {}