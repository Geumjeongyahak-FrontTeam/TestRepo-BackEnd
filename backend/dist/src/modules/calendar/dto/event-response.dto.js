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
exports.EventCalendarResponseDto = exports.EventDetailResponseDto = exports.EventResponseDto = void 0;
const class_transformer_1 = require("class-transformer");
const calendar_interface_1 = require("../../../libs/interface/calendar.interface");
const class_interface_1 = require("../../../libs/interface/shared/class.interface");
const class_validator_1 = require("class-validator");
const class_interface_2 = require("../../../libs/interface/shared/class.interface");
let EventResponseDto = class EventResponseDto {
};
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], EventResponseDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(calendar_interface_1.EventType),
    __metadata("design:type", String)
], EventResponseDto.prototype, "event_type", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(class_interface_1.ClassType),
    __metadata("design:type", String)
], EventResponseDto.prototype, "class_type", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], EventResponseDto.prototype, "event_date", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EventResponseDto.prototype, "is_recurring", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EventResponseDto.prototype, "recurrence_pattern", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], EventResponseDto.prototype, "created_at", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], EventResponseDto.prototype, "updated_at", void 0);
EventResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], EventResponseDto);
exports.EventResponseDto = EventResponseDto;
let ParticipantDto = class ParticipantDto {
};
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ParticipantDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ParticipantDto.prototype, "name", void 0);
ParticipantDto = __decorate([
    (0, class_transformer_1.Exclude)()
], ParticipantDto);
let EventDetailResponseDto = class EventDetailResponseDto extends EventResponseDto {
};
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EventDetailResponseDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => ParticipantDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], EventDetailResponseDto.prototype, "teachers", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => ParticipantDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], EventDetailResponseDto.prototype, "students", void 0);
EventDetailResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], EventDetailResponseDto);
exports.EventDetailResponseDto = EventDetailResponseDto;
// 선택적으로 캘린더 뷰에서 사용할 수 있는 더 자세한 응답 DTO
let EventCalendarResponseDto = class EventCalendarResponseDto extends EventDetailResponseDto {
};
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => StudentAttendanceDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], EventCalendarResponseDto.prototype, "student_attendances", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => TeacherAttendanceDto),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], EventCalendarResponseDto.prototype, "teacher_attendances", void 0);
EventCalendarResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], EventCalendarResponseDto);
exports.EventCalendarResponseDto = EventCalendarResponseDto;
let StudentAttendanceDto = class StudentAttendanceDto {
};
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StudentAttendanceDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], StudentAttendanceDto.prototype, "student_id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(class_interface_2.AttendanceStatus),
    __metadata("design:type", String)
], StudentAttendanceDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(class_interface_1.ClassType),
    __metadata("design:type", String)
], StudentAttendanceDto.prototype, "class_type", void 0);
StudentAttendanceDto = __decorate([
    (0, class_transformer_1.Exclude)()
], StudentAttendanceDto);
let TeacherAttendanceDto = class TeacherAttendanceDto {
};
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TeacherAttendanceDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], TeacherAttendanceDto.prototype, "teacher_id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(class_interface_2.AttendanceStatus),
    __metadata("design:type", String)
], TeacherAttendanceDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_validator_1.IsEnum)(calendar_interface_1.EventType),
    __metadata("design:type", String)
], TeacherAttendanceDto.prototype, "event_type", void 0);
TeacherAttendanceDto = __decorate([
    (0, class_transformer_1.Exclude)()
], TeacherAttendanceDto);
