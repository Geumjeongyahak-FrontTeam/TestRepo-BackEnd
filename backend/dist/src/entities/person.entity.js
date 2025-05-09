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
exports.StudentAttendanceEntity = exports.TeacherAttendanceEntity = exports.StudentClassScheduleEntity = exports.StudentEntity = exports.TeacherClassScheduleEntity = exports.TeacherEntity = exports.PersonStatus = void 0;
const typeorm_1 = require("typeorm");
// import { 
//   Student, 
//   Teacher, 
// } from '../../../libs/interface/person.interface'
const class_interface_1 = require("../libs/interface/shared/class.interface");
const calendar_interface_1 = require("../libs/interface/calendar.interface");
const calendar_entity_1 = require("./calendar/calendar.entity");
const user_entity_1 = require("./user.entity");
var PersonStatus;
(function (PersonStatus) {
    PersonStatus["PROSPECTIVE"] = "PROSPECTIVE";
    PersonStatus["ACTIVE"] = "ACTIVE";
    PersonStatus["INACTIVE"] = "INACTIVE";
})(PersonStatus = exports.PersonStatus || (exports.PersonStatus = {}));
let TeacherEntity = class TeacherEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TeacherEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], TeacherEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], TeacherEntity.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], TeacherEntity.prototype, "birth_date", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.UserEntity, user => user.teacher),
    __metadata("design:type", user_entity_1.UserEntity)
], TeacherEntity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], TeacherEntity.prototype, "started_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], TeacherEntity.prototype, "finished_at", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PersonStatus,
        default: PersonStatus.ACTIVE
    }),
    __metadata("design:type", String)
], TeacherEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TeacherEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TeacherEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeacherClassScheduleEntity, schedule => schedule.teacher),
    __metadata("design:type", Array)
], TeacherEntity.prototype, "class_schedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_entity_1.CalendarEventTeacherEntity, eventTeacher => eventTeacher.teacher),
    __metadata("design:type", Array)
], TeacherEntity.prototype, "calendarEventTeachers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_entity_1.CalendarSpecialEventTeacherEntity, eventTeacher => eventTeacher.teacher),
    __metadata("design:type", Array)
], TeacherEntity.prototype, "calendarSpecialEventTeachers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => TeacherAttendanceEntity, attendance => attendance.teacher),
    __metadata("design:type", Array)
], TeacherEntity.prototype, "attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_entity_1.ClassCancellationTeacherEntity, cancellationTeacher => cancellationTeacher.teacher),
    __metadata("design:type", Array)
], TeacherEntity.prototype, "classCancellationTeachers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_entity_1.ClassExchangeTeacherEntity, exchangeTeacher => exchangeTeacher.teacher),
    __metadata("design:type", Array)
], TeacherEntity.prototype, "classExchangeTeachers", void 0);
TeacherEntity = __decorate([
    (0, typeorm_1.Entity)('teachers')
], TeacherEntity);
exports.TeacherEntity = TeacherEntity;
let TeacherClassScheduleEntity = class TeacherClassScheduleEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TeacherClassScheduleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TeacherClassScheduleEntity.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: class_interface_1.ClassType
    }),
    __metadata("design:type", String)
], TeacherClassScheduleEntity.prototype, "class_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], TeacherClassScheduleEntity.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TeacherEntity, teacher => teacher.class_schedules, {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", TeacherEntity)
], TeacherClassScheduleEntity.prototype, "teacher", void 0);
TeacherClassScheduleEntity = __decorate([
    (0, typeorm_1.Entity)('teacher_class_schedules'),
    (0, typeorm_1.Index)(['teacher_id', 'class_type', 'day_of_week'], { unique: true })
], TeacherClassScheduleEntity);
exports.TeacherClassScheduleEntity = TeacherClassScheduleEntity;
let StudentEntity = class StudentEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StudentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], StudentEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], StudentEntity.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], StudentEntity.prototype, "birth_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], StudentEntity.prototype, "started_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], StudentEntity.prototype, "finished_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], StudentEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PersonStatus,
        default: PersonStatus.ACTIVE
    }),
    __metadata("design:type", String)
], StudentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StudentClassScheduleEntity, schedule => schedule.student),
    __metadata("design:type", Array)
], StudentEntity.prototype, "class_schedules", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => StudentAttendanceEntity, attendance => attendance.student),
    __metadata("design:type", Array)
], StudentEntity.prototype, "attendances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => calendar_entity_1.CalendarSpecialEventStudentEntity, studentEvent => studentEvent.student),
    __metadata("design:type", Array)
], StudentEntity.prototype, "calendarSpecialEventStudents", void 0);
StudentEntity = __decorate([
    (0, typeorm_1.Entity)('students')
], StudentEntity);
exports.StudentEntity = StudentEntity;
let StudentClassScheduleEntity = class StudentClassScheduleEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StudentClassScheduleEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StudentClassScheduleEntity.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: class_interface_1.ClassType
    }),
    __metadata("design:type", String)
], StudentClassScheduleEntity.prototype, "class_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], StudentClassScheduleEntity.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StudentEntity, student => student.class_schedules, {
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", StudentEntity)
], StudentClassScheduleEntity.prototype, "student", void 0);
StudentClassScheduleEntity = __decorate([
    (0, typeorm_1.Entity)('student_class_schedules'),
    (0, typeorm_1.Index)(['student_id', 'class_type', 'day_of_week'], { unique: true })
], StudentClassScheduleEntity);
exports.StudentClassScheduleEntity = StudentClassScheduleEntity;
let TeacherAttendanceEntity = class TeacherAttendanceEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TeacherAttendanceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TeacherAttendanceEntity.prototype, "teacher_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TeacherAttendanceEntity.prototype, "calendar_event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TeacherAttendanceEntity.prototype, "calendar_special_event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: class_interface_1.AttendanceStatus,
        default: class_interface_1.AttendanceStatus.ABSENT
    }),
    __metadata("design:type", String)
], TeacherAttendanceEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: calendar_interface_1.EventType,
        default: calendar_interface_1.EventType.CLASS
    }),
    __metadata("design:type", String)
], TeacherAttendanceEntity.prototype, "event_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: class_interface_1.ClassType,
        nullable: true
    }),
    __metadata("design:type", String)
], TeacherAttendanceEntity.prototype, "class_type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => TeacherEntity, teacher => teacher.attendances, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", TeacherEntity)
], TeacherAttendanceEntity.prototype, "teacher", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_entity_1.CalendarEventEntity, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'calendar_event_id' }),
    __metadata("design:type", calendar_entity_1.CalendarEventEntity)
], TeacherAttendanceEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_entity_1.CalendarSpecialEventEntity, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'calendar_special_event_id' }),
    __metadata("design:type", calendar_entity_1.CalendarSpecialEventEntity)
], TeacherAttendanceEntity.prototype, "special_event", void 0);
TeacherAttendanceEntity = __decorate([
    (0, typeorm_1.Entity)('teacher_attendance'),
    (0, typeorm_1.Index)(['teacher_id', 'calendar_event_id'], { unique: true, where: '"calendar_event_id" IS NOT NULL' }),
    (0, typeorm_1.Index)(['teacher_id', 'calendar_special_event_id'], { unique: true, where: '"calendar_special_event_id" IS NOT NULL' })
], TeacherAttendanceEntity);
exports.TeacherAttendanceEntity = TeacherAttendanceEntity;
let StudentAttendanceEntity = class StudentAttendanceEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StudentAttendanceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], StudentAttendanceEntity.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StudentAttendanceEntity.prototype, "calendar_event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], StudentAttendanceEntity.prototype, "calendar_special_event_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: class_interface_1.AttendanceStatus,
        default: class_interface_1.AttendanceStatus.ABSENT
    }),
    __metadata("design:type", String)
], StudentAttendanceEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => StudentEntity, student => student.attendances, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", StudentEntity)
], StudentAttendanceEntity.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_entity_1.CalendarEventEntity, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'calendar_event_id' }),
    __metadata("design:type", calendar_entity_1.CalendarEventEntity)
], StudentAttendanceEntity.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => calendar_entity_1.CalendarSpecialEventEntity, {
        nullable: true,
        onDelete: 'CASCADE',
        onUpdate: 'RESTRICT'
    }),
    (0, typeorm_1.JoinColumn)({ name: 'calendar_special_event_id' }),
    __metadata("design:type", calendar_entity_1.CalendarSpecialEventEntity)
], StudentAttendanceEntity.prototype, "special_event", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: class_interface_1.ClassType,
        nullable: true,
    }),
    __metadata("design:type", String)
], StudentAttendanceEntity.prototype, "class_type", void 0);
StudentAttendanceEntity = __decorate([
    (0, typeorm_1.Entity)('student_attendance'),
    (0, typeorm_1.Index)(['student_id', 'calendar_event_id'], { unique: true, where: '"calendar_event_id" IS NOT NULL' }),
    (0, typeorm_1.Index)(['student_id', 'calendar_special_event_id'], { unique: true, where: '"calendar_special_event_id" IS NOT NULL' })
], StudentAttendanceEntity);
exports.StudentAttendanceEntity = StudentAttendanceEntity;
