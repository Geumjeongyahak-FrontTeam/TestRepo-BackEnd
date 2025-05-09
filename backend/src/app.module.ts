import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import configuration from './config/config';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // 전역 환경 변수 설정
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: 'src/.env',
    }),

    // 캐시 설정
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        ttl: configService.get<number>('cache.ttl'),
        max: configService.get<number>('cache.max'),
      }),
      inject: [ConfigService],
    }),

    // 데이터베이스 설정
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const password = configService.get('database.password');
        console.log('🧪 DB password:', password, 'type:', typeof password);

        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: password,
          database: configService.get<string>('database.name'),
          entities: ['dist/**/*.entity{.ts,.js}'],
          synchronize: process.env.NODE_ENV !== 'production',
          logging: process.env.NODE_ENV !== 'production',
        };
      },
      inject: [ConfigService],
    }),

    // 앱 모듈들
    CalendarModule,
    AuthModule,
  ],
})
export class AppModule {}
