import { Controller, Get } from '@nestjs/common';
import { TicketServiceService } from './ticket-service.service';
import { AllTicketResponse, CreateParticipationRequest, Empty, ParticipationByIdRequest, ParticipationResponse, QueryParamsRequest, ScanTicketRequest, TicketByIdRequest, TicketResponse, TicketServiceProtoController, TicketServiceProtoControllerMethods, UpdateParticipationRequest, UpdateTicketRequest } from '@app/common/types/ticket';
import { Observable } from 'rxjs';

@Controller()
@TicketServiceProtoControllerMethods()
export class TicketServiceController implements TicketServiceProtoController {
  constructor(private readonly ticketServiceService: TicketServiceService) {}
  scanTicket(request: ScanTicketRequest){
    return this.ticketServiceService.scanTicket(request.code);
  }
  checkIn(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse {
    throw new Error('Method not implemented.');
  }
  cancelTicket(request: TicketByIdRequest): Promise<TicketResponse> | Observable<TicketResponse> | TicketResponse {
    throw new Error('Method not implemented.');
  }
  getParticipant(request: QueryParamsRequest): Promise<ParticipationResponse> | Observable<ParticipationResponse> | ParticipationResponse {
    throw new Error('Method not implemented.');
  }
  getParticipantById(request: ParticipationByIdRequest): Promise<ParticipationResponse> | Observable<ParticipationResponse> | ParticipationResponse {
    throw new Error('Method not implemented.');
  }
  updateParticipant(request: UpdateParticipationRequest): Promise<ParticipationResponse> | Observable<ParticipationResponse> | ParticipationResponse {
    throw new Error('Method not implemented.');
  }
  deleteParticipant(request: ParticipationByIdRequest): Promise<Empty> | Observable<Empty> | Empty {
    throw new Error('Method not implemented.');
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
