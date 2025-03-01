import { Controller, Get } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { Observable } from 'rxjs';
import { EventPattern } from '@nestjs/microservices';
import { TicketServiceProtoControllerMethods, TicketServiceProtoController, GetParticipantByEventIdRequest, ScanTicketRequest, TicketByIdRequest, TicketResponse, ParticipationResponse, ParticipationByIdRequest, CreateParticipationRequest, UpdateTicketRequest, QueryParamsRequest, GetUserParticipationByEventIdResponse, TicketByParticipantIdRequest, GetParticipantIdByUserIdEventIdRequest, GetDetailedParticipantListRequest, GetDetailedParticipantListResponse, CheckInCheckOutRequest } from '../../../libs/common/src/types/ticket';

@Controller()
@TicketServiceProtoControllerMethods()
export class TicketServiceController implements TicketServiceProtoController {
  constructor(private readonly ticketServiceService: TicketServiceService) {}

  checkInByEventAndUser(request: CheckInCheckOutRequest){
    return this.ticketServiceService.checkInByEventAndUser(request);
  }

  checkOutByEventAndUser(request: CheckInCheckOutRequest){
    return this.ticketServiceService.checkOutByEventAndUser(request);
  }

  getParticipantRegisteredForEvent(request: GetParticipantByEventIdRequest) {
    return this.ticketServiceService.getParticipantRegisteredForEvent(request.eventId);
  }

  getDetailedParticipantList(request: GetDetailedParticipantListRequest) {
    return this.ticketServiceService.getDetailedParticipantList(request);
  }

  getCheckInOutStats(request: GetParticipantByEventIdRequest){ // <-- Thêm handler này
    return this.ticketServiceService.getCheckInOutStats(request);
  }

  getParticipantByEventAndUser(request: GetParticipantIdByUserIdEventIdRequest) {
    return this.ticketServiceService.getParticipantByEventAndUser(request);
  }
  getParticipantIdByUserIdEventId(request: GetParticipantIdByUserIdEventIdRequest) { // New controller function
    return this.ticketServiceService.getParticipantIdByUserIdEventId(request);
  }

  getUserParticipationByEventId(request: GetParticipantByEventIdRequest) {
    return this.ticketServiceService.getUserParticipationByEventId(request.eventId);
  }

  getParticipantByEventId(request: GetParticipantByEventIdRequest) {
    return this.ticketServiceService.getParticipantByEventId(request.eventId);
  }

  @EventPattern('getParticipant')
  getParticipant(request: any) {
    console.log('getParticipant', request);
    return this.ticketServiceService.getParticipantOfUser(request);
  }
  
  @EventPattern('cancelEvent')
  cancelEvent(request: { eventId: string }) {
    console.log('cancelEvent', request);
    return this.ticketServiceService.cancelEvent(request.eventId);
  }

  scanTicket(request: ScanTicketRequest){
    return this.ticketServiceService.scanTicket(request.code);
  }
  checkIn(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse {
    throw new Error('Method not implemented.');
  }
  getParticipantById(request: ParticipationByIdRequest): Promise<ParticipationResponse> | Observable<ParticipationResponse> | ParticipationResponse {
    throw new Error('Method not implemented.');
  }
  updateParticipant(request: CreateParticipationRequest) {
    return this.ticketServiceService.updateParticipant(request);
  }
  deleteParticipant(request: ParticipationByIdRequest) {
    return this.ticketServiceService.deleteParticipant(request.id);
  }

  getAllTicket(request: QueryParamsRequest) {
    return this.ticketServiceService.getAllTicket(request);
  }

  getTicketByParticipantId(request: TicketByParticipantIdRequest) { // Function mới
    return this.ticketServiceService.getTicketByParticipantId(request.participantId);
  }

  createParticipant(request: CreateParticipationRequest) {
    return this.ticketServiceService.createParticipant(request);
  }
}
