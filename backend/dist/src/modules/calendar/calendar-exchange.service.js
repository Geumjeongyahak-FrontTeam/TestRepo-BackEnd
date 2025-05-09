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
var CalendarExchangeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarExchangeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const calendar_entity_1 = require("../../entities/calendar/calendar.entity");
const retry_util_1 = require("../../common/utils/retry.util");
const calendar_interface_1 = require("../../libs/interface/calendar.interface");
var ConflictType;
(function (ConflictType) {
    ConflictType["SCHEDULE"] = "SCHEDULE";
    ConflictType["CLASS_TYPE"] = "CLASS_TYPE";
    ConflictType["OTHER"] = "OTHER";
})(ConflictType || (ConflictType = {}));
let CalendarExchangeService = CalendarExchangeService_1 = class CalendarExchangeService {
    constructor(eventRepository, eventTeacherRepository, connection) {
        this.eventRepository = eventRepository;
        this.eventTeacherRepository = eventTeacherRepository;
        this.connection = connection;
        this.logger = new common_1.Logger(CalendarExchangeService_1.name);
        this.maxAttempts = 3;
        this.retryDelay = 1000;
    }
    async swapTeachers(swapDto) {
        return await (0, retry_util_1.withRetry)(async () => {
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
                throw new common_1.NotFoundException('One or both events not found');
            }
            if (event1.event_type !== calendar_interface_1.EventType.CLASS || event2.event_type !== calendar_interface_1.EventType.CLASS) {
                throw new common_1.BadRequestException('Teacher exchange is only possible for class events');
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
                throw new common_1.BadRequestException('Teacher assignments do not match the events');
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
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                if (error instanceof Error) {
                    this.logger.error(`Failed to swap teachers: ${error.message}`);
                }
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }, this.maxAttempts, this.retryDelay, this.logger, 'swapTeachers');
    }
    async validateTeacherExchange(swapDto) {
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
            if (event.event_type !== calendar_interface_1.EventType.CLASS) {
                conflicts.push({
                    conflict_type: ConflictType.CLASS_TYPE,
                    details: 'Event is not a class event'
                });
                continue;
            }
            const targetTeacherId = event.id === event_id1 ? teacher_id2 : teacher_id1;
            const hasScheduleConflict = await this.checkTeacherScheduleConflict(targetTeacherId, event.event_date, event.id);
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
    async checkTeacherScheduleConflict(teacherId, date, excludeEventId) {
        const existingEvents = await this.eventRepository
            .createQueryBuilder('event')
            .innerJoin('event.teachers', 'teacher')
            .where('teacher.teacher_id = :teacherId', { teacherId })
            .andWhere('event.event_date = :date', { date })
            .andWhere('event.id != :excludeEventId', { excludeEventId })
            .getCount();
        return existingEvents > 0;
    }
};
CalendarExchangeService = CalendarExchangeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventTeacherEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Connection])
], CalendarExchangeService);
exports.CalendarExchangeService = CalendarExchangeService;
