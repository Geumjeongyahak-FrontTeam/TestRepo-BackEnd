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
exports.EventDetailQueryDto = exports.EventQueryDto = exports.EventQueryPeriod = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
/**
 *  Event Query Period  Enum
 */
var EventQueryPeriod;
(function (EventQueryPeriod) {
    EventQueryPeriod["THREE_MONTHS"] = "THREE_MONTHS";
    EventQueryPeriod["ONE_MONTH"] = "ONE_MONTH";
    EventQueryPeriod["ONE_WEEK"] = "ONE_WEEK";
    EventQueryPeriod["ONE_DAY"] = "ONE_DAY";
})(EventQueryPeriod = exports.EventQueryPeriod || (exports.EventQueryPeriod = {}));
/**
 * Period based Event Qeury DTO
 * - period, cacheToken:
 */
class EventQueryDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(EventQueryPeriod),
    __metadata("design:type", String)
], EventQueryDto.prototype, "period", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EventQueryDto.prototype, "cache_token", void 0);
exports.EventQueryDto = EventQueryDto;
class EventDetailQueryDto {
}
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], EventDetailQueryDto.prototype, "eventDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EventDetailQueryDto.prototype, "cache_token", void 0);
exports.EventDetailQueryDto = EventDetailQueryDto;
