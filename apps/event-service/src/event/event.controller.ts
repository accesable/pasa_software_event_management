import { Controller } from '@nestjs/common';
import { EventService } from './event.service';
import { Observable } from 'rxjs';
import { EventCategoryService } from '../event-category/event-category.service';
import { SpeakerService } from '../speaker/speaker.service';
import { GuestService } from '../guest/guest.service';
import { EventPattern } from '@nestjs/microservices';
import { AcceptInvitationRequest, AllEventResponse, CancelEventRequest, CategoryByIdRequest, CheckOwnerShipRequest, CreateCategoryRequest, CreateEventRequest, CreateGuestRequest, CreateSpeakerRequest, DeclineInvitationRequest, Empty, EventByIdRequest, EventServiceController, EventServiceControllerMethods, FindByIdRequest, GetAllRequest, getOrganizedEventsRequest, getParticipatedEventsRequest, GuestResponse, QueryParamsRequest, SendEventInvitesRequest, SendEventInvitesResponse, SpeakerResponse, UpdateCategoryRequest, UpdateEventRequest, UpdateGuestRequest, UpdateSpeakerRequest } from '../../../../libs/common/src/types/event';

@Controller()
@EventServiceControllerMethods()
export class EventController implements EventServiceController {
  constructor(
    private readonly eventService: EventService,
    private readonly categoryService: EventCategoryService,
    private readonly speakerService: SpeakerService,
    private readonly guestService: GuestService,
  ) { }

  updateSpeaker(request: UpdateSpeakerRequest): Promise<SpeakerResponse> | Observable<SpeakerResponse> | SpeakerResponse {
    return this.speakerService.updateSpeaker(request);
  }
  updateGuest(request: UpdateGuestRequest): Promise<GuestResponse> | Observable<GuestResponse> | GuestResponse {
    return this.guestService.updateGuest(request);
  }
  getSpeakerById(request: FindByIdRequest): Promise<SpeakerResponse> | Observable<SpeakerResponse> | SpeakerResponse {
    return this.speakerService.getSpeakerById(request);
  }
  getGuestById(request: FindByIdRequest): Promise<GuestResponse> | Observable<GuestResponse> | GuestResponse {
    return this.guestService.getGuestById(request);
  }

  getOrganizedEvents(request: getOrganizedEventsRequest) {
    return this.eventService.getOrganizedEvents(request.userId, request.status);
  }
  
  getParticipatedEvents(request: getParticipatedEventsRequest) {
    return this.eventService.getParticipatedEvents(request.userId, request.status);
  }

  async acceptInvitation(request: AcceptInvitationRequest) {
    return this.eventService.acceptInvitation(request.eventId, request.token);
  }
  
  async declineInvitation(request: DeclineInvitationRequest) {
    return this.eventService.declineInvitation(request.eventId, request.token);
  }

  isExistEvent(request: EventByIdRequest) {
    return this.eventService.isExistEvent(request.id);
  }

  @EventPattern('ticket_created')
  updateEventDocument(request: any) {
    console.log('updateEventDocument', request);
    return this.eventService.decreaseMaxParticipant(request.eventId);
  }

  @EventPattern('ticket_deleted')
  increaseMaxParticipant(request: any) {
    console.log('increaseMaxParticipant', request);
    return this.eventService.increaseMaxParticipant(request.eventId);
  }

  async sendEventInvites(
    request: SendEventInvitesRequest,
  ): Promise<SendEventInvitesResponse> {
    return this.eventService.sendEventInvites(request);
  }

  checkOwnerShip(request: CheckOwnerShipRequest) {
    return this.eventService.checkOwnership(request.eventId, request.userId);
  }

  cancelEvent(request: CancelEventRequest) {
    return this.eventService.cancelEvent(request);
  }

  getAllGuest(request: GetAllRequest) {
    return this.guestService.getAllGuest(request.userId);
  }

  createGuest(request: CreateGuestRequest) {
    return this.guestService.createGuest(request);
  }

  createSpeaker(request: CreateSpeakerRequest) {
    return this.speakerService.createSpeaker(request);
  }
  getAllSpeaker(request: GetAllRequest) {
    return this.speakerService.getAllSpeaker(request.userId);
  }

  // async getAllEventByCategoryName(request: CategoryNameRequest) {
  //   const res = await this.categoryService.getCategoryByName(request.name);
  //   return this.eventService.getAllEventByCategoryName(res.category.id);
  // }

  getAllEvent(request: QueryParamsRequest) {
    return this.eventService.getAllEvent(request);
  }

  getEventById(request: EventByIdRequest) {
    return this.eventService.getEventById(request);
  }

  async createEvent(request: CreateEventRequest) {
    const isExistCategory = await this.categoryService.getCategoryById(request.categoryId);
    return this.eventService.createEvent(request, isExistCategory);
  }

  updateEvent(request: UpdateEventRequest) {
    return this.eventService.updateEvent(request);
  }

  getCategoryById(request: CategoryByIdRequest) {
    return this.categoryService.getCategoryById(request.id);
  }

  getAllCategory(request: Empty) {
    return this.categoryService.getAllCategory();
  }

  createCategory(request: CreateCategoryRequest) {
    return this.categoryService.createCategory(request);
  }

  updateCategory(request: UpdateCategoryRequest) {
    return this.categoryService.updateCategory(request);
  }
}

