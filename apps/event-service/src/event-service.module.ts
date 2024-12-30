import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/env.validation';
import { EventModule } from 'apps/event-service/src/event/event.module';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    EventModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/event-service/.env.example',
    }),

    ClientsModule.register([
      {
        name: 'TICKET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:1234@localhost:5672'],
          queue: 'tickets_queue',
          queueOptions: { durable: true },
        },
      },
    ]),

    forwardRef(() => EventModule),
  ],
  exports: [
    ClientsModule
  ]
})
export class EventServiceModule { }
