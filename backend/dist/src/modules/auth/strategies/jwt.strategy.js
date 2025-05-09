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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("../auth.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService, authService) {
        var _a;
        const options = {
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: (_a = configService.get('JWT_SECRET')) !== null && _a !== void 0 ? _a : 'default-secret',
            passReqToCallback: true,
        };
        super(options);
        this.configService = configService;
        this.authService = authService;
    }
    async validate(req, payload) {
        var _a;
        // 요청 헤더에서 토큰 추출
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        // 토큰이 유효한지 확인 (블랙리스트 체크 포함)
        if (!token || !this.authService.validateToken(token)) {
            throw new common_1.UnauthorizedException('유효하지 않은 토큰입니다.');
        }
        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role,
            teacher_id: payload.teacher_id
        };
    }
};
JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        auth_service_1.AuthService])
], JwtStrategy);
exports.JwtStrategy = JwtStrategy;
