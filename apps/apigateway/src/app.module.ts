import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from 'apps/auth/src/core/transform.interceptor';
import { validateEnv } from 'apps/apigateway/src/config/env.validation';
import { UsersModule } from './users/users.module';
import { FilesModule } from 'apps/apigateway/src/files/files.module';
import { EventServiceModule } from 'apps/apigateway/src/event-service/event-service.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { NotificationModule } from 'apps/apigateway/src/notification/notification.module';

@Module({
  imports: [
    UsersModule,
    FilesModule,
    EventServiceModule,
    NotificationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/apigateway/.env.example',
      validate: validateEnv,
    }),

    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule { }
