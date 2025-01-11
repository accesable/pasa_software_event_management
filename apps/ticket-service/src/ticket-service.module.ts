import { forwardRef, Module } from '@nestjs/common';
import { TicketServiceController } from './ticket-service.controller';
import { TicketServiceService } from './ticket-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_PACKAGE_NAME } from '../../../libs/common/src';
import { EVENT_PACKAGE_NAME } from '../../../libs/common/src/types/event';
import { EVENT_SERVICE, AUTH_SERVICE } from '../../apigateway/src/constants/service.constant';
import { Participant, ParticipantSchema } from './schemas/participant';
import { Ticket, TicketSchema } from './schemas/ticket';

@Module({
  imports: [
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
      envFilePath: 'apps/ticket-service/.env.example',
    }),

    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Participant.name, schema: ParticipantSchema },
    ]),

    ClientsModule.register([
      {
        name: 'EVENT_SERVICE_RABBIT',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:1234@localhost:5672'],
          queue: 'events_queue',
          queueOptions: { durable: true },
        },
      },
      // {
      //   name: 'TICKET_SERVICE',
      //   transport: Transport.RMQ,
      //   options: {
      //     urls: ['amqp://admin:1234@localhost:5672'],
      //     queue: 'tickets_queue',
      //     queueOptions: { durable: true },
      //   },
      // },
      {
        name: EVENT_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: EVENT_PACKAGE_NAME,
          protoPath: join(__dirname, '../event.proto'),
          url: '0.0.0.0:50052'
        },
      },
      {
        name: AUTH_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../auth.proto'),
          url: '0.0.0.0:50051'
        },
      }
    ]),
  ],
  controllers: [TicketServiceController],
  providers: [TicketServiceService]
})
export class TicketServiceModule { }
