import { Module } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { TicketServiceController } from './ticket-service.controller';

@Module({
  controllers: [TicketServiceController],
  providers: [TicketServiceService],
})
export class TicketServiceModule {}
