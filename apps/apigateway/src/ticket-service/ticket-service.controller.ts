import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { CreateParticipationRequest, QueryParamsRequest } from '@app/common/types/ticket';
import { ResponseMessage } from 'apps/auth/src/decorators/public.decorator';

@Controller('tickets')
export class TicketServiceController {
  constructor(
    private readonly ticketServiceService: TicketServiceService,
  ) { }

  @Get()
  @ResponseMessage('Get all ticket success')
  getAllTicket(@Query() request: QueryParamsRequest) {
    return this.ticketServiceService.getAllTicket(request);
  }

  @Get('scan')
  @ResponseMessage('Scan ticket success')
  scanTicket(@Query('code') code: string) {
    return this.ticketServiceService.scanTicket(code);
  }
}

@Controller('participants')
export class ParticipantServiceController {
  constructor(
    private readonly ticketServiceService: TicketServiceService,
  ) { }

  @Post()
  async createParticipant(@Body() request: CreateParticipationRequest) {
    return this.ticketServiceService.createParticipant(request);
  }
}
