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
var CalendarController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const common_1 = require("@nestjs/common");
const calendar_service_1 = require("./calendar.service");
const calendar_exchange_service_1 = require("./calendar-exchange.service");
const calendar_cancellation_service_1 = require("./calendar-cancellation.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const event_query_dto_1 = require("./dto/event-query.dto");
const exchange_class_dto_1 = require("./dto/exchange-class.dto");
const cancellation_class_dto_1 = require("./dto/cancellation-class.dto");
const swagger_1 = require("@nestjs/swagger");
let CalendarController = CalendarController_1 = class CalendarController {
    constructor(calendarService, calendarExchangeService, calendarCancellationService) {
        this.calendarService = calendarService;
        this.calendarExchangeService = calendarExchangeService;
        this.calendarCancellationService = calendarCancellationService;
        this.logger = new common_1.Logger(CalendarController_1.name);
    }
    async createEvent(createEventDto) {
        this.logger.log(`Creating new event: ${JSON.stringify(createEventDto)}`);
        return this.calendarService.createEvent(createEventDto);
    }
    async createBulkEvents(events) {
        this.logger.log(`Creating ${events.length} events in bulk`);
        return this.calendarService.createBulkEvents(events);
    }
    async getEvent(id) {
        this.logger.log(`Fetching Event with id: ${id}`);
        return this.calendarService.getSingleEvent(id);
    }
    async getEventsByDateRange(period) {
        const queryDto = new event_query_dto_1.EventQueryDto();
        queryDto.period = period;
        this.logger.log(`Fetching Events with Period: ${queryDto.period}`);
        return this.calendarService.getEventsByPeriod(queryDto);
    }
    testRange(period) {
        return { period };
    }
    async getSingleEventDetail(id) {
        this.logger.log(`Fetching Event in detail for event id: ${id}`);
        return this.calendarService.getEventDetail(id);
    }
    async updateEvent(id, updateEventDto) {
        this.logger.log(`Updating event ${id}: ${JSON.stringify(updateEventDto)}`);
        return this.calendarService.updateEvent(id, updateEventDto);
    }
    async deleteEvent(id) {
        this.logger.log(`Deleting event ${id}`);
        await this.calendarService.deleteEvent(id);
        return { message: 'Event deleted successfully' };
    }
    async exchange(exchangeDto) {
        this.logger.log(`Exchanging teachers with data: ${JSON.stringify(exchangeDto)}`);
        return this.calendarExchangeService.swapTeachers(exchangeDto);
    }
    async cancel(cancelDto) {
        this.logger.log(`Cancelling class with data: ${JSON.stringify(cancelDto)}`);
        return this.calendarCancellationService.cancelClass(cancelDto);
    }
};
__decorate([
    (0, common_1.Post)('events'),
    (0, swagger_1.ApiOperation)({ summary: '단일 수업 이벤트 생성' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '이벤트 생성 성공' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Post)('events/bulk'),
    (0, swagger_1.ApiOperation)({ summary: '여러 수업 이벤트 일괄 생성' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '이벤트 일괄 생성 성공' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "createBulkEvents", null);
__decorate([
    (0, common_1.Get)('events/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'ID로 단일 이벤트 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '이벤트 조회 성공' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getEvent", null);
__decorate([
    (0, common_1.Get)('events-range'),
    (0, swagger_1.ApiOperation)({ summary: '기간에 따른 이벤트 목록 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '이벤트 목록 반환' }),
    __param(0, (0, common_1.Query)('period', new common_1.ParseEnumPipe(event_query_dto_1.EventQueryPeriod))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getEventsByDateRange", null);
__decorate([
    (0, common_1.Get)('test-range'),
    (0, swagger_1.ApiOperation)({ summary: '기간 쿼리 테스트용 API' }),
    __param(0, (0, common_1.Query)('period', new common_1.ParseEnumPipe(event_query_dto_1.EventQueryPeriod))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CalendarController.prototype, "testRange", null);
__decorate([
    (0, common_1.Get)('events/detail'),
    (0, swagger_1.ApiOperation)({ summary: '이벤트 상세 정보 조회' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '이벤트 상세 반환' }),
    __param(0, (0, common_1.Query)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "getSingleEventDetail", null);
__decorate([
    (0, common_1.Put)('events/:id'),
    (0, swagger_1.ApiOperation)({ summary: '이벤트 수정' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '이벤트 수정 완료' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)('events/:id'),
    (0, swagger_1.ApiOperation)({ summary: '이벤트 삭제' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '삭제 완료 메시지 반환' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Post)('exchange'),
    (0, swagger_1.ApiOperation)({ summary: '수업 교환 신청' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '교환 처리 성공' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exchange_class_dto_1.ExchangeClassDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "exchange", null);
__decorate([
    (0, common_1.Post)('cancel'),
    (0, swagger_1.ApiOperation)({ summary: '수업 취소 신청' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '취소 처리 성공' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cancellation_class_dto_1.CancelClassDto]),
    __metadata("design:returntype", Promise)
], CalendarController.prototype, "cancel", null);
CalendarController = CalendarController_1 = __decorate([
    (0, swagger_1.ApiTags)('Calendar'),
    (0, common_1.Controller)('calendar'),
    __metadata("design:paramtypes", [calendar_service_1.CalendarService,
        calendar_exchange_service_1.CalendarExchangeService,
        calendar_cancellation_service_1.CalendarCancellationService])
], CalendarController);
exports.CalendarController = CalendarController;
