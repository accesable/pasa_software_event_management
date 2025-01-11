import { Controller } from '@nestjs/common';
import { EventService } from './event.service';
import { Observable } from 'rxjs';
import { EventCategoryService } from '../event-category/event-category.service';
import { SpeakerService } from '../speaker/speaker.service';
import { GuestService } from '../guest/guest.service';
import { EventPattern } from '@nestjs/microservices';
import { AllEventResponse, CancelEventRequest, CategoryByIdRequest, CategoryNameRequest, CheckOwnerShipRequest, CreateCategoryRequest, CreateEventRequest, CreateGuestRequest, CreateSpeakerRequest, Empty, EventByIdRequest, EventServiceController, EventServiceControllerMethods, QueryParamsRequest, SendEventInvitesRequest, SendEventInvitesResponse, UpdateCategoryRequest, UpdateEventRequest } from '../../../../libs/common/src/types/event';

@Controller()
@EventServiceControllerMethods()
export class EventController implements EventServiceController {
  constructor(
    private readonly eventService: EventService,
    private readonly categoryService: EventCategoryService,
    private readonly speakerService: SpeakerService,
    private readonly guestService: GuestService,
  ) { }

  // async acceptInvitation(request: AcceptInvitationRequest) {
  //   return this.eventService.acceptInvitation(request);
  // }
  
  // async declineInvitation(request: DeclineInvitationRequest) {
  //   return this.eventService.declineInvitation(request);
  // }

  isExistEvent(request: EventByIdRequest) {
    return this.eventService.isExistEvent(request.id);
  }

  @EventPattern('ticket_created')
  updateEventDocument(request: any) {
    console.log('updateEventDocument', request);
    return this.eventService.decreaseMaxParticipant(request.eventId);
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

  getAllGuest(request: Empty) {
    return this.guestService.getAllGuest();
  }

  createGuest(request: CreateGuestRequest) {
    return this.guestService.createGuest(request);
  }

  createSpeaker(request: CreateSpeakerRequest) {
    return this.speakerService.createSpeaker(request);
  }
  getAllSpeaker(request: Empty) {
    return this.speakerService.getAllSpeaker();
  }

  getAllEventByCategoryName(request: CategoryNameRequest): Promise<AllEventResponse> | Observable<AllEventResponse> | AllEventResponse {
    throw new Error('Method not implemented.');
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

