import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { CheckInCheckOutRequest, CreateParticipationRequest, QueryParamsRequest } from '../../../../libs/common/src/types/ticket';
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

  @Post('event/:eventId/user/:userId/check-in')
  @ResponseMessage('Check-in success')
  async checkInByEventAndUser(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    const request: CheckInCheckOutRequest = { eventId, userId };
    return this.ticketServiceService.checkInByEventAndUser(request);
  }

  @Post('event/:eventId/user/:userId/check-out')
  @ResponseMessage('Check-out success')
  async checkOutByEventAndUser(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    const request: CheckInCheckOutRequest = { eventId, userId };
    return this.ticketServiceService.checkOutByEventAndUser(request);
  }

  @Get('event/:eventId/detailed-list') // Endpoint mới
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get detailed participant list success')
  async getDetailedParticipantList(
    @Param('eventId') eventId: string,
    @Query() query: any,
    @User() user: DecodeAccessResponse
  ) {
    const request = {
      eventId,
      query
    };
    return this.ticketServiceService.getDetailedParticipantList(request);
  }

  @Get(':eventId/check-in-out-stats')
  @ResponseMessage('Get event check-in-out stats success')
  async getCheckInOutStats(
    @Param('eventId') eventId: string,
  ) {
    return this.ticketServiceService.getCheckInOutStats({ eventId });
  }

  @Get(':participantId/tickets')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get ticket by participant id success')
  async getTicketByParticipantId(
    @Param('participantId') participantId: string,
    @User() user: DecodeAccessResponse
  ) {
    return this.ticketServiceService.getTicketByParticipantId(participantId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Create participant success')
  async createParticipant(@Body() request: CreateParticipationRequest, @User() user: DecodeAccessResponse) {
    return this.ticketServiceService.createParticipant({ ...request, userId: user.id });
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
    return this.ticketServiceService.updateParticipant({ eventId: id, ...request, userId: user.id });
  }

  @Get('event/:eventId/participant-id') // Updated Endpoint - Removed userId from path
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Get participant id by event id success') // Updated Response message
  async getParticipantIdByUserIdEventId( // Updated function name - More accurate
    @Param('eventId') eventId: string,
    @User() user: DecodeAccessResponse // Updated User object
  ) {
    return this.ticketServiceService.getParticipantIdByUserIdEventId({ userId: user.id, eventId }); // Pass eventId and User object
  }
}
