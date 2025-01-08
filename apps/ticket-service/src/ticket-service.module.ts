import { Module } from '@nestjs/common';
import { TicketServiceController } from './ticket-service.controller';
import { TicketServiceService } from './ticket-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { Ticket, TicketSchema } from 'apps/ticket-service/src/schemas/ticket';
import { Participant, ParticipantSchema } from 'apps/ticket-service/src/schemas/participant';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENT_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { EVENT_PACKAGE_NAME } from '@app/common/types/event';
import { join } from 'path';

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
      }
    ]),
  ],
  controllers: [TicketServiceController],
  providers: [TicketServiceService],
})
export class TicketServiceModule { }
