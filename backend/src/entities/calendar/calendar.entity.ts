import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import {
  CalendarDay,
  CalendarEvent,
  CalendarSpecialEvent,
  EventType
} from '../../libs/interface/calendar.interface';
import { ClassType } from '../../libs/interface/shared/class.interface';
import { StudentEntity, TeacherEntity, StudentAttendanceEntity, TeacherAttendanceEntity } from '../person.entity';
import { CalendarEventDescriptionEntity, CalendarSpecialEventDescriptionEntity } from './calendar-description.entity';

// CalendarEvent는 기본적으로 수업만 담당
@Entity('class_exchange')
export class ClassExchangeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => CalendarEventEntity, event => event.exchange, { cascade: true })
  events!: CalendarEventEntity[];

  @OneToMany(() => ClassExchangeTeacherEntity, exchangeTeacher => exchangeTeacher.exchange)
  teachers!: ClassExchangeTeacherEntity[];
}

@Entity('class_exchange_teacher')
export class ClassExchangeTeacherEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  exchange_id!: number;

  @Column()
  teacher_id!: number;

  @ManyToOne(() => ClassExchangeEntity, exchange => exchange.teachers)
  @JoinColumn({ name: 'exchange_id' })
  exchange!: ClassExchangeEntity;

  @ManyToOne(() => TeacherEntity, teacher => teacher.classExchangeTeachers)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: TeacherEntity;
}

@Entity('calendar_event')
export class CalendarEventEntity implements CalendarEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  event_date!: CalendarDay;

  @Column({
    type: 'enum',
    enum: EventType
  })
  event_type!: EventType;

  @Column({
    type: 'enum',
    enum: ClassType,
    nullable: true
  })
  class_type?: ClassType;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToOne(() => CalendarEventDescriptionEntity, description => description.event, {
    cascade: true
  })
  @JoinColumn()
  description!: CalendarEventDescriptionEntity;

  @OneToMany(() => TeacherAttendanceEntity, attendance => attendance.event)
  teacher_attendances!: TeacherAttendanceEntity[];

  @OneToMany(() => StudentAttendanceEntity, attendance => attendance.event)
  student_attendances!: StudentAttendanceEntity[];

  @OneToMany(() => CalendarEventTeacherEntity, teacherEvent => teacherEvent.event, {
    cascade: true
  })
  teachers!: CalendarEventTeacherEntity[];

  @OneToMany(() => CalendarEventStudentEntity, studentEvent => studentEvent.event, {
    cascade: true,
    nullable: true
  })
  students?: CalendarEventStudentEntity[];

  @ManyToOne(() => ClassExchangeEntity, exchange => exchange.events, { nullable: true })
  @JoinColumn({ name: 'exchange_id' })
  exchange?: ClassExchangeEntity;

  @Column({ nullable: true })
  is_recurring?: boolean;

  @Column({ nullable: true })
  recurrence_pattern?: string;
}


@Entity('calendar_event_teacher')
export class CalendarEventTeacherEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event_id!: number;

  @Column()
  teacher_id!: number;

  @ManyToOne(() => CalendarEventEntity, event => event.teachers, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'event_id' })
  event!: CalendarEventEntity;

  @ManyToOne(() => TeacherEntity)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: TeacherEntity;
}

@Entity('calendar_event_student')
export class CalendarEventStudentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event_id!: number;

  @Column()
  student_id!: number;

  @ManyToOne(() => CalendarEventEntity, event => event.students, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'event_id' })
  event!: CalendarEventEntity;

  @ManyToOne(() => StudentEntity)
  @JoinColumn({ name: 'student_id' })
  student!: StudentEntity;
}

@Entity('class_cancellation')
export class ClassCancellationEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => CalendarEventEntity, { onDelete: 'CASCADE' })
  @Index({ unique: true })
  @JoinColumn({ name: 'event_id' })
  event!: CalendarEventEntity;

  @Column({ type: 'text', nullable: true })
  cancellation_reason?: string;

  @CreateDateColumn({ type: 'timestamp' })
  cancelled_at!: Date;

  // 결강에 연관된 선생님들을 연결하는 조인 테이블 관계
  @OneToMany(() => ClassCancellationTeacherEntity, cancellationTeacher => cancellationTeacher.cancellation, {
    cascade: true,
  })
  teachers!: ClassCancellationTeacherEntity[];
}

@Entity('class_cancellation_teacher')
export class ClassCancellationTeacherEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  cancellation_id!: number;

  @Column()
  teacher_id!: number;

  @ManyToOne(() => ClassCancellationEntity, cancellation => cancellation.teachers)
  @JoinColumn({ name: 'cancellation_id' })
  cancellation!: ClassCancellationEntity;

  @ManyToOne(() => TeacherEntity, teacher => teacher.classCancellationTeachers)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: TeacherEntity;
}

@Entity('calendar_special_event')
export class CalendarSpecialEventEntity implements CalendarSpecialEvent {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  custom_event_type!: string;

  @Column({ type: 'date' })
  event_start_date!: Date;

  @Column({ type: 'date' })
  event_end_date!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @OneToOne(() => CalendarSpecialEventDescriptionEntity, description => description.event, {
    cascade: true
  })
  @JoinColumn()
  description!: CalendarSpecialEventDescriptionEntity;

  @OneToMany(() => CalendarSpecialEventTeacherEntity, teacherEvent => teacherEvent.event, {
    cascade: true
  })
  teachers!: CalendarSpecialEventTeacherEntity[];

  @OneToMany(() => CalendarSpecialEventStudentEntity, studentEvent => studentEvent.event, {
    cascade: true,
    nullable: true
  })
  students?: CalendarSpecialEventStudentEntity[];

  @OneToMany(() => TeacherAttendanceEntity, attendance => attendance.event)
  teacher_attendances!: TeacherAttendanceEntity[];

  // 수업 이벤트인 경우에만 사용
  @OneToMany(() => StudentAttendanceEntity, attendance => attendance.event)
  student_attendances?: StudentAttendanceEntity[];

}

@Entity('calendar_special_event_teacher')
export class CalendarSpecialEventTeacherEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event_id!: number;

  @Column()
  teacher_id!: number;

  @ManyToOne(() => CalendarSpecialEventEntity, event => event.teachers)
  @JoinColumn({ name: 'event_id' })
  event!: CalendarSpecialEventEntity;

  @ManyToOne(() => TeacherEntity, teacher => teacher.calendarSpecialEventTeachers)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: TeacherEntity;
}

@Entity('calendar_special_event_student')
export class CalendarSpecialEventStudentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  event_id!: number;

  @Column()
  student_id!: number;

  @ManyToOne(() => CalendarSpecialEventEntity, event => event.students)
  @JoinColumn({ name: 'event_id' })
  event!: CalendarSpecialEventEntity;

  @ManyToOne(() => StudentEntity, student => student.calendarSpecialEventStudents)
  @JoinColumn({ name: 'student_id' })
  student!: StudentEntity;
}