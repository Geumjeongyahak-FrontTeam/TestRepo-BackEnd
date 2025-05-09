"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_2 = __importDefault(require("./config/config"));
const calendar_module_1 = require("./modules/calendar/calendar.module");
const auth_module_1 = require("./modules/auth/auth.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // 전역 환경 변수 설정
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [config_2.default],
                envFilePath: 'src/.env',
            }),
            // 캐시 설정
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    ttl: configService.get('cache.ttl'),
                    max: configService.get('cache.max'),
                }),
                inject: [config_1.ConfigService],
            }),
            // 데이터베이스 설정
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const password = configService.get('database.password');
                    console.log('🧪 DB password:', password, 'type:', typeof password);
                    return {
                        type: 'postgres',
                        host: configService.get('database.host'),
                        port: configService.get('database.port'),
                        username: configService.get('database.username'),
                        password: password,
                        database: configService.get('database.name'),
                        entities: ['dist/**/*.entity{.ts,.js}'],
                        synchronize: process.env.NODE_ENV !== 'production',
                        logging: process.env.NODE_ENV !== 'production',
                    };
                },
                inject: [config_1.ConfigService],
            }),
            // 앱 모듈들
            calendar_module_1.CalendarModule,
            auth_module_1.AuthModule,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
