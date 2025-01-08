import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { CreateParticipationRequest, QueryParamsRequest } from '@app/common/types/ticket';
import { ResponseMessage } from 'apps/auth/src/decorators/public.decorator';
import { JwtAuthGuard } from 'apps/apigateway/src/guards/jwt-auth.guard';
import { User } from 'apps/apigateway/src/decorators/public.decorator';
import { DecodeAccessResponse } from '@app/common';

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
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Create participant success')
  async createParticipant(@Body() request: CreateParticipationRequest, @User() user: DecodeAccessResponse) {
    return this.ticketServiceService.createParticipant({...request, userId: user.id});
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Delete participant success')
  async deleteParticipant(@Param('id') id: string) {
    return this.ticketServiceService.deleteParticipant(id);
  }
}
