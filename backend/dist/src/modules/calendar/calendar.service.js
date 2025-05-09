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
var CalendarService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const typeorm_2 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const date_fns_1 = require("date-fns");
const person_entity_1 = require("../../entities/person.entity");
const calendar_entity_1 = require("../../entities/calendar/calendar.entity");
const calendar_description_entity_1 = require("../../entities/calendar/calendar-description.entity");
const retry_util_1 = require("../../common/utils/retry.util");
const event_query_dto_1 = require("./dto/event-query.dto");
const event_response_dto_1 = require("./dto/event-response.dto");
const calendar_interface_1 = require("../../libs/interface/calendar.interface");
let CalendarService = CalendarService_1 = class CalendarService {
    constructor(eventRepository, eventTeacherRepository, eventStudentRepository, teacherRepository, studentRepository, teacherScheduleRepository, studentScheduleRepository, calendarEventTeacherRepository, calendarEventStudentRepository, studentAttendanceRepository, teacherAttendanceRepository, classCancellationRepository, cacheManager, configService) {
        var _a, _b;
        this.eventRepository = eventRepository;
        this.eventTeacherRepository = eventTeacherRepository;
        this.eventStudentRepository = eventStudentRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.teacherScheduleRepository = teacherScheduleRepository;
        this.studentScheduleRepository = studentScheduleRepository;
        this.calendarEventTeacherRepository = calendarEventTeacherRepository;
        this.calendarEventStudentRepository = calendarEventStudentRepository;
        this.studentAttendanceRepository = studentAttendanceRepository;
        this.teacherAttendanceRepository = teacherAttendanceRepository;
        this.classCancellationRepository = classCancellationRepository;
        this.cacheManager = cacheManager;
        this.configService = configService;
        this.logger = new common_1.Logger(CalendarService_1.name);
        this.maxAttempts = (_a = this.configService.get('retry.maxAttempts')) !== null && _a !== void 0 ? _a : 5;
        this.retryDelay = (_b = this.configService.get('retry.delay')) !== null && _b !== void 0 ? _b : 500;
    }
    async createEvent(createEventDto) {
        return await (0, retry_util_1.withRetry)(async () => {
            var _a, _b;
            const now = new Date();
            const queryRunner = this.eventRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const calendarEventDescription = new calendar_description_entity_1.CalendarEventDescriptionEntity();
                calendarEventDescription.description = createEventDto.description;
                const event = this.eventRepository.create({
                    event_type: createEventDto.event_type,
                    event_date: createEventDto.event_date,
                    class_type: createEventDto.event_type === calendar_interface_1.EventType.CLASS ? createEventDto.class_type : undefined,
                    is_recurring: createEventDto.is_recurring,
                    recurrence_pattern: createEventDto.recurrence_pattern,
                    description: calendarEventDescription,
                    created_at: now,
                    updated_at: now
                });
                const savedEvent = await queryRunner.manager.save(event);
                if ((_a = createEventDto.teacher_ids) === null || _a === void 0 ? void 0 : _a.length) {
                    const teacherEvents = createEventDto.teacher_ids.map(teacherId => ({
                        event_id: savedEvent.id,
                        teacher_id: teacherId
                    }));
                    await queryRunner.manager.save(calendar_entity_1.CalendarEventTeacherEntity, teacherEvents);
                }
                if (createEventDto.event_type === calendar_interface_1.EventType.CLASS && ((_b = createEventDto.student_ids) === null || _b === void 0 ? void 0 : _b.length)) {
                    const studentEvents = createEventDto.student_ids.map(studentId => ({
                        event_id: savedEvent.id,
                        student_id: studentId
                    }));
                    await queryRunner.manager.save(calendar_entity_1.CalendarEventStudentEntity, studentEvents);
                }
                await queryRunner.commitTransaction();
                await this.invalidateDailyCache(event.event_date);
                return { success: true };
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }, this.maxAttempts, this.retryDelay, this.logger, 'createEvent');
    }
    async createBulkEvents(events) {
        return await (0, retry_util_1.withRetry)(async () => {
            var _a, _b;
            const queryRunner = this.eventRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            const createdEvents = [];
            const errorDetails = [];
            try {
                for (const eventDto of events) {
                    try {
                        const event = new calendar_entity_1.CalendarEventEntity();
                        event.event_type = eventDto.event_type;
                        event.event_date = eventDto.event_date;
                        event.class_type = eventDto.event_type === calendar_interface_1.EventType.CLASS ? eventDto.class_type : undefined;
                        event.is_recurring = eventDto.is_recurring;
                        event.recurrence_pattern = eventDto.recurrence_pattern;
                        const description = new calendar_description_entity_1.CalendarEventDescriptionEntity();
                        description.description = eventDto.description;
                        event.description = description;
                        const savedEvent = await queryRunner.manager.save(event);
                        if ((_a = eventDto.teacher_ids) === null || _a === void 0 ? void 0 : _a.length) {
                            const teacherEvents = eventDto.teacher_ids.map(teacherId => ({
                                event_id: savedEvent.id,
                                teacher_id: teacherId
                            }));
                            await queryRunner.manager.save(calendar_entity_1.CalendarEventTeacherEntity, teacherEvents);
                        }
                        if (eventDto.event_type === calendar_interface_1.EventType.CLASS && ((_b = eventDto.student_ids) === null || _b === void 0 ? void 0 : _b.length)) {
                            const studentEvents = eventDto.student_ids.map(studentId => ({
                                event_id: savedEvent.id,
                                student_id: studentId
                            }));
                            await queryRunner.manager.save(calendar_entity_1.CalendarEventStudentEntity, studentEvents);
                        }
                        createdEvents.push(savedEvent);
                    }
                    catch (error) {
                        const errorMsg = error instanceof Error ? error.message : 'unknown error';
                        errorDetails.push(`Failed for event on ${eventDto.event_date}: ${errorMsg}`);
                    }
                }
                if (errorDetails.length === 0) {
                    await queryRunner.commitTransaction();
                    const uniqueDates = new Set(createdEvents.map(event => (0, date_fns_1.format)(event.event_date, 'yyyy-MM-dd')));
                    await Promise.all([...uniqueDates].map(date => this.invalidateEventCaches(new Date(date))));
                    return { success: true, createdCount: createdEvents.length };
                }
                else {
                    await queryRunner.rollbackTransaction();
                    return {
                        success: false,
                        createdCount: 0,
                        errorDetails
                    };
                }
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }, this.maxAttempts, this.retryDelay, this.logger, 'createBulkEvents');
    }
    async getSingleEvent(id) {
        const cacheKey = `event:${id}`;
        const cachedEvent = await this.cacheManager.get(cacheKey);
        if (cachedEvent) {
            this.logger.debug(`Cache hit for event ${id}`);
            return (0, class_transformer_1.plainToInstance)(event_response_dto_1.EventResponseDto, cachedEvent);
        }
        const event = await (0, retry_util_1.withRetry)(async () => {
            return await this.eventRepository.findOne({ where: { id } });
        }, this.maxAttempts, this.retryDelay, this.logger, 'getSingleEvent');
        if (!event) {
            throw new common_1.NotFoundException(`Event with id ${id} not found.`);
        }
        await this.cacheManager.set(cacheKey, event);
        return (0, class_transformer_1.plainToInstance)(event_response_dto_1.EventResponseDto, event);
    }
    async getEventsByPeriod(queryDto) {
        const { startDate, endDate } = this.calculateDateRange(queryDto);
        const cacheKey = `events:${(0, date_fns_1.format)(startDate, 'yyyy-MM-dd')}:${(0, date_fns_1.format)(endDate, 'yyyy-MM-dd')}`;
        let events = await this.cacheManager.get(cacheKey);
        if (events) {
            this.logger.debug(`Cache hit for period ${startDate} to ${endDate}`);
            return events;
        }
        events = await (0, retry_util_1.withRetry)(async () => {
            const events = await this.eventRepository
                .createQueryBuilder('event')
                .leftJoinAndSelect('event.description', 'description')
                .leftJoinAndSelect('event.teachers', 'teachers')
                .leftJoinAndSelect('teachers.teacher', 'teacher')
                .leftJoinAndSelect('event.students', 'students')
                .leftJoinAndSelect('students.student', 'student')
                .where('event.event_date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            })
                .orderBy('event.event_date', 'ASC')
                .getMany();
            await Promise.all(events.map(event => this.cacheManager.set(`event:${event.id}`, event, 60 * 60 * 24)));
            return events;
        }, this.maxAttempts, this.retryDelay, this.logger, 'getEventsByPeriod');
        await this.cacheManager.set(cacheKey, events, 60 * 60);
        return (0, class_transformer_1.plainToInstance)(event_response_dto_1.EventResponseDto, events);
    }
    async getEventDetail(id) {
        const cacheKey = `eventDetail:${id}`;
        const cachedEvent = await this.cacheManager.get(cacheKey);
        if (cachedEvent) {
            this.logger.debug(`Cache hit for event detail with id ${id}`);
            return (0, class_transformer_1.plainToInstance)(event_response_dto_1.EventDetailResponseDto, cachedEvent);
        }
        return await (0, retry_util_1.withRetry)(async () => {
            const event = await this.eventRepository
                .createQueryBuilder('event')
                .leftJoinAndSelect('event.description', 'description')
                .leftJoinAndSelect('event.teachers', 'teachers')
                .leftJoinAndSelect('teachers.teacher', 'teacher')
                .leftJoinAndSelect('event.students', 'students')
                .leftJoinAndSelect('students.student', 'student')
                .where('event.id = :id', { id })
                .getOne();
            if (!event) {
                return null;
            }
            await this.cacheManager.set(cacheKey, event, 60 * 60 * 24);
            return (0, class_transformer_1.plainToInstance)(event_response_dto_1.EventDetailResponseDto, event);
        }, this.maxAttempts, this.retryDelay, this.logger, 'getEventDetail');
    }
    async updateEvent(id, updateEventDto) {
        return await (0, retry_util_1.withRetry)(async () => {
            const queryRunner = this.eventRepository.manager.connection.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const event = await this.eventRepository.findOne({ where: { id } });
                if (!event) {
                    throw new common_1.NotFoundException(`Event with id ${id} not found.`);
                }
                Object.assign(event, Object.assign(Object.assign({}, updateEventDto), { class_type: updateEventDto.event_type === calendar_interface_1.EventType.CLASS ? updateEventDto.class_type : undefined, updated_at: new Date() }));
                await queryRunner.manager.save(event);
                if (updateEventDto.teacher_ids) {
                    await queryRunner.manager.delete(calendar_entity_1.CalendarEventTeacherEntity, { event_id: id });
                    const teacherEvents = updateEventDto.teacher_ids.map(teacherId => ({
                        event_id: id,
                        teacher_id: teacherId
                    }));
                    await queryRunner.manager.save(calendar_entity_1.CalendarEventTeacherEntity, teacherEvents);
                }
                if (event.event_type === calendar_interface_1.EventType.CLASS && updateEventDto.student_ids) {
                    await queryRunner.manager.delete(calendar_entity_1.CalendarEventStudentEntity, { event_id: id });
                    const studentEvents = updateEventDto.student_ids.map(studentId => ({
                        event_id: id,
                        student_id: studentId
                    }));
                    await queryRunner.manager.save(calendar_entity_1.CalendarEventStudentEntity, studentEvents);
                }
                await queryRunner.commitTransaction();
                await this.invalidateDailyCache(event.event_date);
                return { success: true };
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
                throw error;
            }
            finally {
                await queryRunner.release();
            }
        }, this.maxAttempts, this.retryDelay, this.logger, 'updateEvent');
    }
    async deleteEvent(id) {
        return await (0, retry_util_1.withRetry)(async () => {
            const event = await this.eventRepository.findOne({ where: { id } });
            if (!event) {
                throw new common_1.NotFoundException(`Delete Target Event not found : ${id}`);
            }
            await this.teacherAttendanceRepository.delete({ event: { id } });
            await this.studentAttendanceRepository.delete({ event: { id } });
            await this.calendarEventTeacherRepository.delete({ event_id: id });
            await this.calendarEventStudentRepository.delete({ event_id: id });
            await this.classCancellationRepository.delete(id);
            await this.eventRepository.delete(id);
            await this.invalidateDailyCache(event.event_date);
            return { success: true };
        }, this.maxAttempts, this.retryDelay, this.logger, 'deleteEvent');
    }
    calculateDateRange(queryDto) {
        const today = new Date();
        switch (queryDto.period) {
            case event_query_dto_1.EventQueryPeriod.THREE_MONTHS: {
                const currentMonth = today.getMonth();
                return {
                    startDate: new Date(today.getFullYear(), currentMonth - 1, 1),
                    endDate: new Date(today.getFullYear(), currentMonth + 2, 0)
                };
            }
            case event_query_dto_1.EventQueryPeriod.ONE_MONTH: {
                return {
                    startDate: (0, date_fns_1.startOfMonth)(today),
                    endDate: (0, date_fns_1.endOfMonth)(today)
                };
            }
            case event_query_dto_1.EventQueryPeriod.ONE_WEEK: {
                const dayOfWeek = today.getDay();
                const startDate = new Date(today);
                startDate.setDate(today.getDate() - dayOfWeek);
                const endDate = new Date(today);
                endDate.setDate(today.getDate() + (6 - dayOfWeek));
                return { startDate, endDate };
            }
            case event_query_dto_1.EventQueryPeriod.ONE_DAY: {
                const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                return { startDate: date, endDate: date };
            }
            default:
                throw new Error('Unsupported period');
        }
    }
    // 캐싱 구조 하루 단위로 하면 안될 것 같은데
    // 이벤트 단위 캐싱을 하고 메타 캐싱으로 묶어서 하는게 좋지 않을까
    async invalidateDailyCache(eventDate) {
        const dateKey = (0, date_fns_1.format)(eventDate, 'yyyy-MM-dd');
        const cacheKey = `events:${dateKey}`;
        await this.cacheManager.del(cacheKey);
        this.logger.debug(`Daily cache invalidated for date: ${dateKey}`);
    }
    async invalidateMonthCache(eventDate) {
        const firstDay = (0, date_fns_1.startOfMonth)(eventDate);
        const lastDay = (0, date_fns_1.endOfMonth)(eventDate);
        const days = (0, date_fns_1.eachDayOfInterval)({ start: firstDay, end: lastDay });
        for (const day of days) {
            const dateKey = (0, date_fns_1.format)(day, 'yyyy-MM-dd'); // "YYYY-MM-DD" 형식의 날짜 문자열
            const cacheKey = `events:${dateKey}`;
            await this.cacheManager.del(cacheKey);
            this.logger.debug(`Monthly cache invalidated for date: ${dateKey}`);
        }
    }
    async invalidateRangeCache(eventDate) {
        for (let offset = -1; offset <= 1; offset++) {
            const targetDate = new Date(eventDate.getFullYear(), eventDate.getMonth() + offset, 1);
            await this.invalidateMonthCache(targetDate);
        }
    }
    async invalidateEventCaches(eventDate) {
        await this.invalidateDailyCache(eventDate);
        await this.invalidateMonthCache(eventDate);
        await this.invalidateRangeCache(eventDate);
        this.logger.debug(`All caches invalidated for event date: ${eventDate.toISOString()}`);
    }
};
CalendarService = CalendarService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventTeacherEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventStudentEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(person_entity_1.TeacherEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(person_entity_1.StudentEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(person_entity_1.TeacherClassScheduleEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(person_entity_1.StudentClassScheduleEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventTeacherEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(calendar_entity_1.CalendarEventStudentEntity)),
    __param(9, (0, typeorm_1.InjectRepository)(person_entity_1.StudentAttendanceEntity)),
    __param(10, (0, typeorm_1.InjectRepository)(person_entity_1.TeacherAttendanceEntity)),
    __param(11, (0, typeorm_1.InjectRepository)(calendar_entity_1.ClassCancellationEntity)),
    __param(12, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object, config_1.ConfigService])
], CalendarService);
exports.CalendarService = CalendarService;
