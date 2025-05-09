"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("@nestjs/config");
const common_2 = require("@nestjs/common");
const dotenv = __importStar(require("dotenv"));
const swagger_1 = require("@nestjs/swagger");
const auth_module_1 = require("./modules/auth/auth.module");
const calendar_module_1 = require("./modules/calendar/calendar.module");
async function bootstrap() {
    const logger = new common_2.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    dotenv.config();
    // CORS 설정
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', '*'),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.use((0, helmet_1.default)());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    // Swagger 설정
    const config = new swagger_1.DocumentBuilder()
        .setTitle('API 문서')
        .setDescription('NightSchool 백엔드 API 목록입니다.')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        include: [auth_module_1.AuthModule, calendar_module_1.CalendarModule],
    });
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    // RUN (listen은 딱 한 번만!)
    const port = process.env.PORT || 3000;
    app.enableCors();
    await app.listen(port);
    console.log(`🚀 Swagger running at http://localhost:3000/api-docs`);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
}
bootstrap().catch((error) => {
    new common_2.Logger('Bootstrap').error('Failed to start application', error);
});
