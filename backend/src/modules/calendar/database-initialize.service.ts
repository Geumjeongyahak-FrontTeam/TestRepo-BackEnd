import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import * as fs from 'fs/promises';
import * as path from 'path';

import { TeacherEntity, StudentEntity, TeacherClassScheduleEntity, StudentClassScheduleEntity,StudentAttendanceEntity,TeacherAttendanceEntity } from '../../entities/person.entity';
import {  CalendarEventEntity,CalendarEventStudentEntity, CalendarEventTeacherEntity } from '../../entities/calendar/calendar.entity';
import { CalendarEventDescriptionEntity } from '../../entities/calendar/calendar-description.entity';
import { ClassType, AttendanceStatus } from '../../libs/interface/shared/class.interface';
import { EventType } from '../../libs/interface/calendar.interface';

interface InitialData {
  teachers: {
    name: string;
    birth_date: Date;
    phone_number?: string;
    schedules: {
      class_type: ClassType;
      day_of_week: number;
    }[];
  }[];
  students: {
    name: string;
    birth_date: Date;
    phone_number?: string;
    schedules: {
      class_type: ClassType;
      day_of_week: number;
    }[];
  }[];
}

@Injectable()
export class DatabaseInitializerService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseInitializerService.name);

  constructor(
    @InjectRepository(TeacherEntity)
    private readonly teacherRepository: Repository<TeacherEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(TeacherClassScheduleEntity)
    private readonly teacherScheduleRepository: Repository<TeacherClassScheduleEntity>,
    @InjectRepository(StudentClassScheduleEntity)
    private readonly studentScheduleRepository: Repository<StudentClassScheduleEntity>,
    @InjectRepository(CalendarEventEntity)
    private readonly calendarEventRepository: Repository<CalendarEventEntity>,
    @InjectRepository(CalendarEventTeacherEntity)
    private readonly calendarEventTeacherRepository: Repository<CalendarEventTeacherEntity>,
    @InjectRepository(CalendarEventStudentEntity)
    private readonly calendarEventStudentRepository: Repository<CalendarEventStudentEntity>,
    @InjectRepository(StudentAttendanceEntity)
    private readonly studentAttendanceRepository: Repository<StudentAttendanceEntity>,
    @InjectRepository(TeacherAttendanceEntity)
    private readonly teacherAttendanceRepository: Repository<TeacherAttendanceEntity>,
    private readonly connection: Connection,
  ) {}

  async onModuleInit() {
    const teacherCount = await this.teacherRepository.count();
    if (teacherCount === 0) {
      this.logger.log('Initializing database with teacher and student data...');
      await this.initializeData();
      await this.generateLessonEvents();
    } else {
      this.logger.log('Database already initialized. Skipping initialization.');
    }
  }

  private async initializeData() {
    try {
      const filePath = path.join(process.cwd(), 'data', 'initial-data.json');

      const dataBuffer = await fs.readFile(filePath, 'utf-8');
      const data: InitialData = JSON.parse(dataBuffer);

      // Init Data
      for (const teacherData of data.teachers) {
        const { schedules, ...teacherInfo } = teacherData;
      
        const now = new Date();
        const teacher = await this.teacherRepository.save({
          ...teacherInfo,
          started_at: now,
          finished_at: now,
        });
      
        const scheduleEntities = schedules.map(schedule => ({
          teacher_id: teacher.id,
          ...schedule
        }));
        await this.teacherScheduleRepository.save(scheduleEntities);
      }
      
      for (const studentData of data.students) {
        const { schedules, ...studentInfo } = studentData;
      
        const now = new Date();
        const student = await this.studentRepository.save({
          ...studentInfo,
          started_at: now,
          finished_at: now,
        });
      
        const scheduleEntities = schedules.map(schedule => ({
          student_id: student.id,
          ...schedule
        }));
        await this.studentScheduleRepository.save(scheduleEntities);
      }
      

      this.logger.log('Teachers and students data initialized successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize teacher/student data', error);
      throw error;
    }
  }

  private async generateLessonEvents() {
    const now = new Date();
    const startDate = startOfMonth(addMonths(now, -1));
    const endDate = endOfMonth(addMonths(now, 1));

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      for (const day of days) {
        const dayOfWeek = day.getDay();

        const teacherSchedules = await this.teacherScheduleRepository.find({
          where: { day_of_week: dayOfWeek },
          relations: ['teacher']
        });

        await Promise.all(teacherSchedules.map(async (schedule) => {
          const event = new CalendarEventEntity();
          event.event_type = EventType.CLASS;
          event.class_type = schedule.class_type;
          event.event_date = day;
          event.is_recurring = false;
          event.created_at = now;
          event.updated_at = now;

          const description = new CalendarEventDescriptionEntity();
          description.description = `${schedule.class_type} class`;
          event.description = description;

          const savedEvent = await queryRunner.manager.save(event);

          const eventTeacher = new CalendarEventTeacherEntity();
          eventTeacher.teacher_id = schedule.teacher_id;
          eventTeacher.event = savedEvent;
          await queryRunner.manager.save(eventTeacher);

          const teacherAttendance = new TeacherAttendanceEntity();
          teacherAttendance.teacher_id = schedule.teacher_id;
          teacherAttendance.event = savedEvent;
          teacherAttendance.status = AttendanceStatus.UNASSIGNED;
          teacherAttendance.event_type = EventType.CLASS;
          await queryRunner.manager.save(teacherAttendance);

          const studentSchedules = await this.studentScheduleRepository.find({
            where: {
              class_type: schedule.class_type,
              day_of_week: dayOfWeek
            },
            relations: ['student']
          });

          await Promise.all(studentSchedules.map(async (studentSchedule) => {
            const eventStudent = new CalendarEventStudentEntity();
            eventStudent.student_id = studentSchedule.student_id;
            eventStudent.event = savedEvent;
            await queryRunner.manager.save(eventStudent);

            const studentAttendance = new StudentAttendanceEntity();
            studentAttendance.student_id = studentSchedule.student_id;
            studentAttendance.event = savedEvent;
            studentAttendance.status = AttendanceStatus.UNASSIGNED;
            studentAttendance.class_type = schedule.class_type;
            return queryRunner.manager.save(studentAttendance);
          }));
        }));
      }

      await queryRunner.commitTransaction();
      this.logger.log('Lesson events generated successfully.');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to generate lesson events', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}