import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthModule } from "./modules/auth/auth.module";
import { CalendarModule } from "./modules/calendar/calendar.module"

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  dotenv.config();

  // CORS 설정
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('API 문서')
    .setDescription('NightSchool 백엔드 API 목록입니다.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [AuthModule, CalendarModule], 
  });
  SwaggerModule.setup('api-docs', app, document);

  // RUN (listen은 딱 한 번만!)
  const port = process.env.PORT || 3000;
  app.enableCors();
  await app.listen(port);
  console.log(`🚀 Swagger running at http://localhost:3000/api-docs`);
  
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error('Failed to start application', error);
});
