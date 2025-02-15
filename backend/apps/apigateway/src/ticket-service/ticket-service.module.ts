import { forwardRef, Module } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { ParticipantServiceController, TicketServiceController } from './ticket-service.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RedisCacheModule } from '../redis/redis.module';
import { EventServiceModule } from '../event-service/event-service.module';
import { TICKET_SERVICE } from '../constants/service.constant';
import { TICKET_PACKAGE_NAME } from '../../../../libs/common/src/types/ticket';

@Module({
  imports: [
    RedisCacheModule,
    forwardRef(() => EventServiceModule),
    ClientsModule.register([
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
  controllers: [TicketServiceController, ParticipantServiceController],
  providers: [TicketServiceService],
  exports: [TicketServiceService],
})
export class TicketServiceModule { }
