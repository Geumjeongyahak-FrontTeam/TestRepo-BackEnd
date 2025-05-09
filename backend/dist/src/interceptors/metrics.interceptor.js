"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MetricsInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let MetricsInterceptor = MetricsInterceptor_1 = class MetricsInterceptor {
    constructor() {
        this.logger = new common_1.Logger(MetricsInterceptor_1.name);
    }
    intercept(context, next) {
        var _a;
        const startTime = Date.now();
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const method = request.method;
        // route.path가 없으면 URL을 fallback 처리
        const route = ((_a = request.route) === null || _a === void 0 ? void 0 : _a.path) || request.originalUrl || request.url;
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - startTime;
            const statusCode = response.statusCode;
            const contentLength = response.get('Content-Length') || 'unknown';
            this.logger.log(`HTTP ${method} ${route} succeeded in ${duration}ms, status: ${statusCode}, content length: ${contentLength}`);
            // ADD : External Metric System Cacl Time, Status Code Record Logic
        }), (0, operators_1.catchError)((err) => {
            const duration = Date.now() - startTime;
            const statusCode = response.statusCode;
            this.logger.error(`HTTP ${method} ${route} failed in ${duration}ms, status: ${statusCode}`, err.stack);
            // ADD : External Metric System Error Count Logic
            return (0, rxjs_1.throwError)(err);
        }));
    }
};
MetricsInterceptor = MetricsInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], MetricsInterceptor);
exports.MetricsInterceptor = MetricsInterceptor;
