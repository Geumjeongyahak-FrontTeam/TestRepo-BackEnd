import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// import { 
//   Student, 
//   Teacher, 
// } from '../../../libs/interface/person.interface'
import {
  AttendanceStatus,
  ClassType
} from '../libs/interface/shared/class.interface'
import {
  EventType
} from '../libs/interface/calendar.interface'

import { CalendarEventEntity, 
         CalendarSpecialEventEntity, 
         ClassCancellationTeacherEntity,
         ClassExchangeTeacherEntity,
         CalendarEventTeacherEntity,
         CalendarSpecialEventTeacherEntity,
         CalendarSpecialEventStudentEntity} from './calendar/calendar.entity'

import { UserEntity} from './user.entity'

export enum PersonStatus {
  PROSPECTIVE = 'PROSPECTIVE',
  ACTIVE = 'ACTIVE', 
  INACTIVE = 'INACTIVE',
}

@Entity('teachers')
export class TeacherEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number?: string;

  @Column({ type: 'date' })
  birth_date!: Date;

  @OneToOne(() => UserEntity, user => user.teacher) 
  user?: UserEntity; 

  @Column({ type : 'date'})
  started_at !: Date;

  @Column({ type : 'date'})
  finished_at !: Date;

  @Index() 
  @Column({
    type: 'enum',
    enum: PersonStatus,
    default: PersonStatus.ACTIVE
  })
  status!: PersonStatus;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToMany(() => TeacherClassScheduleEntity, schedule => schedule.teacher)
  class_schedules!: TeacherClassScheduleEntity[];

  @OneToMany(() => CalendarEventTeacherEntity, eventTeacher => eventTeacher.teacher)
  calendarEventTeachers?: CalendarEventTeacherEntity[];

  @OneToMany(() => CalendarSpecialEventTeacherEntity, eventTeacher => eventTeacher.teacher)
  calendarSpecialEventTeachers!: CalendarSpecialEventTeacherEntity[];
  
  @OneToMany(() => TeacherAttendanceEntity, attendance => attendance.teacher)
  attendances?: TeacherAttendanceEntity[];

  @OneToMany(() => ClassCancellationTeacherEntity, cancellationTeacher => cancellationTeacher.teacher)
  classCancellationTeachers?: ClassCancellationTeacherEntity[];

  @OneToMany(() => ClassExchangeTeacherEntity, exchangeTeacher => exchangeTeacher.teacher)
  classExchangeTeachers?: ClassExchangeTeacherEntity[];


}

@Entity('teacher_class_schedules')
@Index(['teacher_id', 'class_type', 'day_of_week'], { unique: true })
export class TeacherClassScheduleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  teacher_id!: number;

  @Column({
    type: 'enum',
    enum: ClassType
  })
  class_type!: ClassType;

  @Column({ type: 'int' })
  day_of_week!: number;

  @ManyToOne(() => TeacherEntity, teacher => teacher.class_schedules, {
    onDelete: 'CASCADE', 
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: TeacherEntity;
}

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number?: string;

  @Column({ type: 'date' })
  birth_date!: Date;

  @Column({ type: 'date' })
  started_at!: Date;

  @Column({ type: 'date' })
  finished_at!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Index() 
  @Column({
    type: 'enum',
    enum: PersonStatus,
    default: PersonStatus.ACTIVE
  })
  status!: PersonStatus;

  @OneToMany(() => StudentClassScheduleEntity, schedule => schedule.student)
  class_schedules!: StudentClassScheduleEntity[];

  @OneToMany(() => StudentAttendanceEntity, attendance => attendance.student)
  attendances?: StudentAttendanceEntity[];

  @OneToMany(() => CalendarSpecialEventStudentEntity, studentEvent => studentEvent.student)
  calendarSpecialEventStudents!: CalendarSpecialEventStudentEntity[];
}

@Entity('student_class_schedules')
@Index(['student_id', 'class_type', 'day_of_week'], { unique: true })
export class StudentClassScheduleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  student_id!: number;

  @Column({
    type: 'enum',
    enum: ClassType
  })
  class_type!: ClassType;

  @Column({ type: 'int' })
  day_of_week!: number;

  @ManyToOne(() => StudentEntity, student => student.class_schedules, {
    onDelete: 'CASCADE', 
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student!: StudentEntity;
}

@Entity('teacher_attendance')
@Index(['teacher_id', 'calendar_event_id'], { unique: true, where: '"calendar_event_id" IS NOT NULL' })
@Index(['teacher_id', 'calendar_special_event_id'], { unique: true, where: '"calendar_special_event_id" IS NOT NULL' })
export class TeacherAttendanceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  teacher_id!: number;

  @Column({ nullable: true })
  calendar_event_id?: number;

  @Column({ nullable: true })
  calendar_special_event_id?: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT
  })
  status!: AttendanceStatus;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.CLASS
  })
  event_type!: EventType;

  @Column({
    type: 'enum',
    enum: ClassType,
    nullable: true
  })
  class_type?: ClassType;

  @ManyToOne(() => TeacherEntity, teacher => teacher.attendances, {
    onDelete: 'RESTRICT', 
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: TeacherEntity;

  @ManyToOne(() => CalendarEventEntity, {
    nullable: true,
    onDelete: 'CASCADE', 
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'calendar_event_id' })
  event?: CalendarEventEntity;

  @ManyToOne(() => CalendarSpecialEventEntity, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'RESTRICT',
   })
  @JoinColumn({ name: 'calendar_special_event_id' })
  special_event?: CalendarSpecialEventEntity;
}

@Entity('student_attendance')
@Index(['student_id', 'calendar_event_id'], { unique: true, where: '"calendar_event_id" IS NOT NULL' })
@Index(['student_id', 'calendar_special_event_id'], { unique: true, where: '"calendar_special_event_id" IS NOT NULL' })
export class StudentAttendanceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  student_id!: number;

  @Column({ nullable: true })
  calendar_event_id?: number;

  @Column({ nullable: true }) 
  calendar_special_event_id?: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT
  })
  status!: AttendanceStatus;

  @ManyToOne(() => StudentEntity, student => student.attendances,{
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn({ name: 'student_id' })
  student!: StudentEntity;

  @ManyToOne(() => CalendarEventEntity, {
    nullable : true,
    onDelete : 'CASCADE',
    onUpdate : 'RESTRICT'})
  @JoinColumn({ name: 'calendar_event_id' })
  event?: CalendarEventEntity;

  @ManyToOne(() => CalendarSpecialEventEntity, {
    nullable : true,
    onDelete : 'CASCADE',
    onUpdate : 'RESTRICT'})
  @JoinColumn({ name : 'calendar_special_event_id'})
  special_event?: CalendarSpecialEventEntity;

  @Column({
    type: 'enum',
    enum: ClassType,
    nullable: true,
  })
  class_type?: ClassType;
}