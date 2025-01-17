import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validateEnv } from './config/env.validation';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventModule } from './event/event.module';
import { TICKET_SERVICE } from '../../apigateway/src/constants/service.constant';
import { TICKET_PACKAGE_NAME } from '../../../libs/common/src/types/ticket';
import { join } from 'path';

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
        name: 'TICKET_SERVICE_RABBIT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:1234@localhost:5672'],
          queue: 'tickets_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:1234@localhost:5672'],
          queue: 'notifications_queue',
          queueOptions: { durable: true },
        },
      },
      {
        name: TICKET_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: TICKET_PACKAGE_NAME,
          protoPath: join(__dirname, '../ticket.proto'),
          url: '0.0.0.0:50054'
        },
      }
    ]),

  ],
  exports: [
    ClientsModule
  ]
})
export class EventServiceModule { }
