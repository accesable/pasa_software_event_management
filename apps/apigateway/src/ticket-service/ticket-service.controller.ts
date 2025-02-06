import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { CreateParticipationRequest, QueryParamsRequest } from '../../../../libs/common/src/types/ticket';
import { DecodeAccessResponse } from '../../../../libs/common/src';
import { ResponseMessage, User } from '../decorators/public.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('tickets')
export class TicketServiceController {
  constructor(
    private readonly ticketServiceService: TicketServiceService,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get all ticket success')
  getAllTicket(@Query() request: QueryParamsRequest, @User() user: DecodeAccessResponse) {
    return this.ticketServiceService.getAllTicket(request);
  }

  @Get('scan')
  @ResponseMessage('Scan ticket success')
  scanTicket(@Query('code') code: string) {
    return this.ticketServiceService.scanTicket(code);
  }

  // @Post(':id/scan/manual')
  // scanTicketManual(@Param('id') id: string, @Body() request: { email: string,  }) {
  //   return this.ticketServiceService.scanTicketManual(id, request);
  // }
}

@Controller('participants')
export class ParticipantServiceController {
  constructor(
    private readonly ticketServiceService: TicketServiceService,
  ) { }

  @Get(':participantId/tickets') // Endpoint mới
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get ticket by participant id success')
  async getTicketByParticipantId(
    @Param('participantId') participantId: string,
    @User() user: DecodeAccessResponse // Có thể cần kiểm tra quyền user nếu cần
  ) {
    return this.ticketServiceService.getTicketByParticipantId(participantId);
  }

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Update participant success')
  async updateParticipant(@Param('id') id: string, @Body() request: any, @User() user: DecodeAccessResponse) {
    return this.ticketServiceService.updateParticipant({eventId: id, ...request, userId: user.id});
  }

  @Get('event/:eventId/participant-id') // Updated Endpoint - Removed userId from path
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get participant id by event id success') // Updated Response message
  async getParticipantIdByUserIdEventId( // Updated function name - More accurate
    @Param('eventId') eventId: string,
    @User() user: DecodeAccessResponse // Updated User object
  ) {
    return this.ticketServiceService.getParticipantIdByUserIdEventId({userId: user.id, eventId}); // Pass eventId and User object
  }
}
