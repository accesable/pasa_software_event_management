import { Module } from '@nestjs/common';
import { TicketServiceController } from './ticket-service.controller';
import { TicketServiceService } from './ticket-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { Ticket, TicketSchema } from 'apps/ticket-service/src/schemas/ticket';
import { Participant, ParticipantSchema } from 'apps/ticket-service/src/schemas/participant';
import { ClientsModule, Transport } from '@nestjs/microservices';

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
        name: 'TICKET_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://admin:1234@localhost:5672'],
          queue: 'tickets_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [TicketServiceController],
  providers: [TicketServiceService],
})
export class TicketServiceModule { }
