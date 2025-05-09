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
exports.CalendarSpecialEventDescriptionEntity = exports.CalendarEventDescriptionEntity = void 0;
const typeorm_1 = require("typeorm");
const calendar_entity_1 = require("./calendar.entity");
let CalendarEventDescriptionEntity = class CalendarEventDescriptionEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarEventDescriptionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CalendarEventDescriptionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => calendar_entity_1.CalendarEventEntity, event => event.description),
    __metadata("design:type", calendar_entity_1.CalendarEventEntity)
], CalendarEventDescriptionEntity.prototype, "event", void 0);
CalendarEventDescriptionEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_event_description')
], CalendarEventDescriptionEntity);
exports.CalendarEventDescriptionEntity = CalendarEventDescriptionEntity;
let CalendarSpecialEventDescriptionEntity = class CalendarSpecialEventDescriptionEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CalendarSpecialEventDescriptionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CalendarSpecialEventDescriptionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => calendar_entity_1.CalendarSpecialEventEntity, event => event.description),
    __metadata("design:type", calendar_entity_1.CalendarSpecialEventEntity)
], CalendarSpecialEventDescriptionEntity.prototype, "event", void 0);
CalendarSpecialEventDescriptionEntity = __decorate([
    (0, typeorm_1.Entity)('calendar_event_description')
], CalendarSpecialEventDescriptionEntity);
exports.CalendarSpecialEventDescriptionEntity = CalendarSpecialEventDescriptionEntity;
