import { Controller } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';

@Controller('ticket-service')
export class TicketServiceController {
  constructor(private readonly ticketServiceService: TicketServiceService) {}
}
