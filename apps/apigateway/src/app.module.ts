import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from '../../auth/src/core/transform.interceptor';
import { validateEnv } from './config/env.validation';
import { UsersModule } from './users/users.module';
import { EventServiceModule } from './event-service/event-service.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { NotificationModule } from './notification/notification.module';
import { TicketServiceModule } from './ticket-service/ticket-service.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisCacheService } from './redis/redis.service';

@Module({
  imports: [
    UsersModule,
    EventServiceModule,
    NotificationModule,
    RedisModule,
    TicketServiceModule,
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

    ClientsModule.register([
      {
        name: 'FILE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:1234@localhost:5672'],
          queue: 'files_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
    forwardRef(() => EventServiceModule),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    RedisCacheService,
  ],
  exports: [RedisCacheService, ClientsModule],
})
export class AppModule { }
