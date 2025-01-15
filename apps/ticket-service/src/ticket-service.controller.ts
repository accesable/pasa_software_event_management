import { Controller, Get } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { Observable } from 'rxjs';
import { EventPattern } from '@nestjs/microservices';
import { QueryParamsRequest } from '../../../libs/common/src';
import { TicketServiceProtoControllerMethods, TicketServiceProtoController, GetParticipantByEventIdRequest, ScanTicketRequest, TicketByIdRequest, TicketResponse, ParticipationResponse, ParticipationByIdRequest, CreateParticipationRequest, UpdateTicketRequest } from '../../../libs/common/src/types/ticket';

@Controller()
@TicketServiceProtoControllerMethods()
export class TicketServiceController implements TicketServiceProtoController {
  constructor(private readonly ticketServiceService: TicketServiceService) {}

  getParticipantByEventId(request: GetParticipantByEventIdRequest) {
    return this.ticketServiceService.getParticipantByEventId(request.eventId);
  }

  @EventPattern('getParticipant')
  getParticipant(request: any) {
    console.log('getParticipant', request);
    return this.ticketServiceService.getParticipant(request);
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
  cancelTicket(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse {
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
  
  getTicketById(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse {
    throw new Error('Method not implemented.');
  }
  
  updateTicket(request: UpdateTicketRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse {
    throw new Error('Method not implemented.');
  }
  deleteTicket(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse {
    throw new Error('Method not implemented.');
  }

  createParticipant(request: CreateParticipationRequest) {
    return this.ticketServiceService.createParticipant(request);
  }
}
