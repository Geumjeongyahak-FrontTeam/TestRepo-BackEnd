"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarSpecialEventStudentEntity = exports.CalendarSpecialEventTeacherEntity = exports.CalendarSpecialEventEntity = exports.ClassCancellationTeacherEntity = exports.ClassCancellationEntity = exports.CalendarEventStudentEntity = exports.CalendarEventTeacherEntity = exports.CalendarEventEntity = exports.ClassExchangeTeacherEntity = exports.ClassExchangeEntity = void 0;
const typeorm_1 = require("typeorm");
const calendar_interface_1 = require("../../libs/interface/calendar.interface");
const class_interface_1 = require("../../libs/interface/shared/class.interface");
const person_entity_1 = require("../person.entity");
const calendar_description_entity_1 = require("./calendar-description.entity");
// CalendarEvent는 기본적으로 수업만 담당
let ClassExchangeEntity = class ClassExchangeEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClassExchangeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CalendarEventEntity, event => event.exchange, { cascade: true }),
    __metadata("design:type", Array)
], ClassExchangeEntity.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ClassExchangeTeacherEntity, exchangeTeacher => exchangeTeacher.exchange),
    __metadata("design:type", Array)
], ClassExchangeEntity.prototype, "teachers", void 0);
ClassExchangeEntity = __decorate([
    (0, typeorm_1.Entity)('class_exchange')
], ClassExchangeEntity);
exports.ClassExchangeEntity = ClassExchangeEntity;
let ClassExchangeTeacherEntity = class ClassExchangeTeacherEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClassExchangeTeacherEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ClassExchangeTeacherEntity.prototype, "exchange_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ClassExchangeTeacherEntity.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ClassExchangeEntity, exchange => exchange.teachers),
    (0, typeorm_1.JoinColumn)({ name: 'exchange_id' }),
    __metadata("design:type", ClassExchangeEntity)
], ClassExchangeTeacherEntity.prototype, "exchange", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => person_entity_1.TeacherEntity, teacher => teacher.classExchangeTeachers),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", person_entity_1.TeacherEntity)
], ClassExchangeTeacherEntity.prototype, "teacher", void 0);
ClassExchangeTeacherEntity = __decorate([
    (0, typeorm_1.Entity)('class_exchange_teacher')
], ClassExchangeTeacherEntity);
exports.ClassExchangeTeacherEntity = ClassExchangeTeacherEntity;
let CalendarEventEntity = class CalendarEventEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarEventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Object)
], CalendarEventEntity.prototype, "event_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: calendar_interface_1.EventType
    }),
    __metadata("design:type", String)
], CalendarEventEntity.prototype, "event_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: class_interface_1.ClassType,
        nullable: true
    }),
    __metadata("design:type", String)
], CalendarEventEntity.prototype, "class_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CalendarEventEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CalendarEventEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => calendar_description_entity_1.CalendarEventDescriptionEntity, description => description.event, {
        cascade: true
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", calendar_description_entity_1.CalendarEventDescriptionEntity)
], CalendarEventEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => person_entity_1.TeacherAttendanceEntity, attendance => attendance.event),
    __metadata("design:type", Array)
], CalendarEventEntity.prototype, "teacher_attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => person_entity_1.StudentAttendanceEntity, attendance => attendance.event),
    __metadata("design:type", Array)
], CalendarEventEntity.prototype, "student_attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CalendarEventTeacherEntity, teacherEvent => teacherEvent.event, {
        cascade: true
    }),
    __metadata("design:type", Array)
], CalendarEventEntity.prototype, "teachers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CalendarEventStudentEntity, studentEvent => studentEvent.event, {
        cascade: true,
        nullable: true
    }),
    __metadata("design:type", Array)
], CalendarEventEntity.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ClassExchangeEntity, exchange => exchange.events, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'exchange_id' }),
    __metadata("design:type", ClassExchangeEntity)
], CalendarEventEntity.prototype, "exchange", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], CalendarEventEntity.prototype, "is_recurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CalendarEventEntity.prototype, "recurrence_pattern", void 0);
CalendarEventEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_event')
], CalendarEventEntity);
exports.CalendarEventEntity = CalendarEventEntity;
let CalendarEventTeacherEntity = class CalendarEventTeacherEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarEventTeacherEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarEventTeacherEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarEventTeacherEntity.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CalendarEventEntity, event => event.teachers, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", CalendarEventEntity)
], CalendarEventTeacherEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => person_entity_1.TeacherEntity),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", person_entity_1.TeacherEntity)
], CalendarEventTeacherEntity.prototype, "teacher", void 0);
CalendarEventTeacherEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_event_teacher')
], CalendarEventTeacherEntity);
exports.CalendarEventTeacherEntity = CalendarEventTeacherEntity;
let CalendarEventStudentEntity = class CalendarEventStudentEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarEventStudentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarEventStudentEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarEventStudentEntity.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CalendarEventEntity, event => event.students, {
        onDelete: 'CASCADE'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", CalendarEventEntity)
], CalendarEventStudentEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => person_entity_1.StudentEntity),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", person_entity_1.StudentEntity)
], CalendarEventStudentEntity.prototype, "student", void 0);
CalendarEventStudentEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_event_student')
], CalendarEventStudentEntity);
exports.CalendarEventStudentEntity = CalendarEventStudentEntity;
let ClassCancellationEntity = class ClassCancellationEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClassCancellationEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => CalendarEventEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", CalendarEventEntity)
], ClassCancellationEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ClassCancellationEntity.prototype, "cancellation_reason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ClassCancellationEntity.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ClassCancellationTeacherEntity, cancellationTeacher => cancellationTeacher.cancellation, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], ClassCancellationEntity.prototype, "teachers", void 0);
ClassCancellationEntity = __decorate([
    (0, typeorm_1.Entity)('class_cancellation')
], ClassCancellationEntity);
exports.ClassCancellationEntity = ClassCancellationEntity;
let ClassCancellationTeacherEntity = class ClassCancellationTeacherEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ClassCancellationTeacherEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ClassCancellationTeacherEntity.prototype, "cancellation_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ClassCancellationTeacherEntity.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ClassCancellationEntity, cancellation => cancellation.teachers),
    (0, typeorm_1.JoinColumn)({ name: 'cancellation_id' }),
    __metadata("design:type", ClassCancellationEntity)
], ClassCancellationTeacherEntity.prototype, "cancellation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => person_entity_1.TeacherEntity, teacher => teacher.classCancellationTeachers),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", person_entity_1.TeacherEntity)
], ClassCancellationTeacherEntity.prototype, "teacher", void 0);
ClassCancellationTeacherEntity = __decorate([
    (0, typeorm_1.Entity)('class_cancellation_teacher')
], ClassCancellationTeacherEntity);
exports.ClassCancellationTeacherEntity = ClassCancellationTeacherEntity;
let CalendarSpecialEventEntity = class CalendarSpecialEventEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarSpecialEventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], CalendarSpecialEventEntity.prototype, "custom_event_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], CalendarSpecialEventEntity.prototype, "event_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], CalendarSpecialEventEntity.prototype, "event_end_date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CalendarSpecialEventEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], CalendarSpecialEventEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => calendar_description_entity_1.CalendarSpecialEventDescriptionEntity, description => description.event, {
        cascade: true
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", calendar_description_entity_1.CalendarSpecialEventDescriptionEntity)
], CalendarSpecialEventEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CalendarSpecialEventTeacherEntity, teacherEvent => teacherEvent.event, {
        cascade: true
    }),
    __metadata("design:type", Array)
], CalendarSpecialEventEntity.prototype, "teachers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CalendarSpecialEventStudentEntity, studentEvent => studentEvent.event, {
        cascade: true,
        nullable: true
    }),
    __metadata("design:type", Array)
], CalendarSpecialEventEntity.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => person_entity_1.TeacherAttendanceEntity, attendance => attendance.event),
    __metadata("design:type", Array)
], CalendarSpecialEventEntity.prototype, "teacher_attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => person_entity_1.StudentAttendanceEntity, attendance => attendance.event),
    __metadata("design:type", Array)
], CalendarSpecialEventEntity.prototype, "student_attendances", void 0);
CalendarSpecialEventEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_special_event')
], CalendarSpecialEventEntity);
exports.CalendarSpecialEventEntity = CalendarSpecialEventEntity;
let CalendarSpecialEventTeacherEntity = class CalendarSpecialEventTeacherEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarSpecialEventTeacherEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarSpecialEventTeacherEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarSpecialEventTeacherEntity.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CalendarSpecialEventEntity, event => event.teachers),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", CalendarSpecialEventEntity)
], CalendarSpecialEventTeacherEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => person_entity_1.TeacherEntity, teacher => teacher.calendarSpecialEventTeachers),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", person_entity_1.TeacherEntity)
], CalendarSpecialEventTeacherEntity.prototype, "teacher", void 0);
CalendarSpecialEventTeacherEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_special_event_teacher')
], CalendarSpecialEventTeacherEntity);
exports.CalendarSpecialEventTeacherEntity = CalendarSpecialEventTeacherEntity;
let CalendarSpecialEventStudentEntity = class CalendarSpecialEventStudentEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarSpecialEventStudentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarSpecialEventStudentEntity.prototype, "event_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CalendarSpecialEventStudentEntity.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CalendarSpecialEventEntity, event => event.students),
    (0, typeorm_1.JoinColumn)({ name: 'event_id' }),
    __metadata("design:type", CalendarSpecialEventEntity)
], CalendarSpecialEventStudentEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => person_entity_1.StudentEntity, student => student.calendarSpecialEventStudents),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", person_entity_1.StudentEntity)
], CalendarSpecialEventStudentEntity.prototype, "student", void 0);
CalendarSpecialEventStudentEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_special_event_student')
], CalendarSpecialEventStudentEntity);
exports.CalendarSpecialEventStudentEntity = CalendarSpecialEventStudentEntity;
