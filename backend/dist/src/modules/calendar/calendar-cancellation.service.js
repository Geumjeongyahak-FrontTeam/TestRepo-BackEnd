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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CalendarCancellationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarCancellationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const calendar_entity_1 = require("../../entities/calendar/calendar.entity");
const person_entity_1 = require("../../entities/person.entity");
const calendar_interface_1 = require("../../libs/interface/calendar.interface");
const class_interface_1 = require("../../libs/interface/shared/class.interface");
const retry_util_1 = require("../../common/utils/retry.util");
let CalendarCancellationService = CalendarCancellationService_1 = class CalendarCancellationService {
    constructor(eventRepository, cancellationRepository, studentAttendanceRepository, teacherAttendanceRepository, connection) {
        this.eventRepository = eventRepository;
        this.cancellationRepository = cancellationRepository;
        this.studentAttendanceRepository = studentAttendanceRepository;
        this.teacherAttendanceRepository = teacherAttendanceRepository;
        this.connection = connection;
        this.logger = new common_1.Logger(CalendarCancellationService_1.name);
        this.maxAttempts = 3;
        this.retryDelay = 1000;
    }
    async cancelClass(cancelDto) {
        return await (0, retry_util_1.withRetry)(async () => {
            const { event_id, teacher_id, cancellation_reason } = cancelDto;
            const event = await this.eventRepository.findOne({
                where: { id: event_id },
                relations: ['teachers']
            });
            if (!event) {
                throw new common_1.NotFoundException(`Could not find Event: ${event_id}`);
            }
            if (event.event_type !== calendar_interface_1.EventType.CLASS) {
                throw new common_1.BadRequestException(`Event ${event_id} is not a class event`);
            }
            const isTeacherAuthorized = event.teachers.some(t => t.teacher_id === teacher_id);
            if (!isTeacherAuthorized) {
                throw new common_1.BadRequestException(`Teacher ${teacher_id} is not authorized for this class`);
            }
            const queryRunner = this.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const cancellation = new calendar_entity_1.ClassCancellationEntity();
                cancellation.event = event;
                cancellation.id = teacher_id; // cancellation.teacher_id -> cancellation.id
                cancellation.cancellation_reason = cancellation_reason;
                const teacherAttendance = new person_entity_1.TeacherAttendanceEntity();
                teacherAttendance.teacher_id = teacher_id;
                teacherAttendance.event = event;
                teacherAttendance.status = class_interface_1.AttendanceStatus.CANCELLED;
                teacherAttendance.event_type = calendar_interface_1.EventType.CLASS;
                const existingStudentAttendances = await this.studentAttendanceRepository.find({
                    where: { event: { id: event_id } }
                });
                const updatedStudentAttendances = existingStudentAttendances.map(attendance => (Object.assign(Object.assign({}, attendance), { status: class_interface_1.AttendanceStatus.CANCELLED })));
                await Promise.all([
                    queryRunner.manager.save(cancellation),
                    queryRunner.manager.save(teacherAttendance),
                    updatedStudentAttendances.length > 0 &&
                        queryRunner.manager.save(person_entity_1.StudentAttendanceEntity, updatedStudentAttendances)
                ].filter(Boolean));
                await queryRunner.commitTransaction();
                this.logger.log(`Class ${event_id} has been cancelled by teacher ${teacher_id}`);
                return { success: true };
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                if (error instanceof Error) {
                    this.logger.error(`Failed to cancel class: ${error.message}`);
                }
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }, this.maxAttempts, this.retryDelay, this.logger, 'cancelClass');
    }
    async getCancellationHistory(event_id) {
        return await (0, retry_util_1.withRetry)(async () => {
            const cancellations = await this.cancellationRepository.find({
                where: { event: { id: event_id } },
                relations: ['event'],
                order: { cancelled_at: 'DESC' }
            });
            if (!cancellations.length) {
                this.logger.debug(`No cancellation history found for event ${event_id}`);
            }
            return cancellations;
        }, this.maxAttempts, this.retryDelay, this.logger, 'getCancellationHistory');
    }
    async validateCancellation(event_id, teacher_id) {
        const event = await this.eventRepository.findOne({
            where: { id: event_id },
            relations: ['teachers']
        });
        if (!event) {
            return { canCancel: false, reason: 'Event not found' };
        }
        if (event.event_type !== calendar_interface_1.EventType.CLASS) {
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
};
CalendarCancellationService = CalendarCancellationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(calendar_entity_1.ClassCancellationEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(person_entity_1.StudentAttendanceEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(person_entity_1.TeacherAttendanceEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Connection])
], CalendarCancellationService);
exports.CalendarCancellationService = CalendarCancellationService;
