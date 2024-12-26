import { Controller, Get } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';

@Controller()
export class TicketServiceController {
  constructor(private readonly ticketServiceService: TicketServiceService) {}

  @Get()
  getHello(): string {
    return this.ticketServiceService.getHello();
  }
}
