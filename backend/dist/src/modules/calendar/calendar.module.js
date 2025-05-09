"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
// Controllers
const calendar_controller_1 = require("./calendar.controller");
// Services
const calendar_service_1 = require("./calendar.service");
const calendar_exchange_service_1 = require("./calendar-exchange.service");
const calendar_cancellation_service_1 = require("./calendar-cancellation.service");
const database_initialize_service_1 = require("./database-initialize.service");
// Entities
const calendar_entity_1 = require("../../entities/calendar/calendar.entity");
const calendar_description_entity_1 = require("../../entities/calendar/calendar-description.entity");
const person_entity_1 = require("../../entities/person.entity");
let CalendarModule = class CalendarModule {
};
CalendarModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                // Calendar entities
                calendar_entity_1.CalendarEventEntity,
                calendar_description_entity_1.CalendarEventDescriptionEntity,
                calendar_entity_1.CalendarEventTeacherEntity,
                calendar_entity_1.CalendarEventStudentEntity,
                calendar_entity_1.ClassCancellationEntity,
                // Person entities
                person_entity_1.TeacherEntity,
                person_entity_1.StudentEntity,
                person_entity_1.TeacherClassScheduleEntity,
                person_entity_1.StudentClassScheduleEntity,
                person_entity_1.TeacherAttendanceEntity,
                person_entity_1.StudentAttendanceEntity,
            ]),
        ],
        controllers: [
            calendar_controller_1.CalendarController,
        ],
        providers: [
            calendar_service_1.CalendarService,
            calendar_exchange_service_1.CalendarExchangeService,
            calendar_cancellation_service_1.CalendarCancellationService,
            database_initialize_service_1.DatabaseInitializerService,
        ],
        exports: [
            calendar_service_1.CalendarService,
            calendar_exchange_service_1.CalendarExchangeService,
            calendar_cancellation_service_1.CalendarCancellationService,
            database_initialize_service_1.DatabaseInitializerService,
        ],
    })
], CalendarModule);
exports.CalendarModule = CalendarModule;
