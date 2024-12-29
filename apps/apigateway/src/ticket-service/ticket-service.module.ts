import { Module } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { ParticipantServiceController, TicketServiceController } from './ticket-service.controller';
import { RedisCacheModule } from 'apps/apigateway/src/redis/redis.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TICKET_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { TICKET_PACKAGE_NAME } from '@app/common/types/ticket';
import { join } from 'path';

@Module({
  imports: [
    RedisCacheModule,
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
})
export class TicketServiceModule { }
