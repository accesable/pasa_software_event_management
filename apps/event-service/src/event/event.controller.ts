import { Controller } from '@nestjs/common';
import { EventService } from './event.service';
import { AllEventResponse, CancelEventRequest, CategoryByIdRequest, CategoryNameRequest, CheckOwnerShipRequest, CheckOwnerShipResponse, CreateCategoryRequest, CreateEventRequest, CreateGuestRequest, CreateSpeakerRequest, Empty, EventByIdRequest, EventResponse, EventServiceController, EventServiceControllerMethods, GuestResponse, IsExistEventResponse, QueryParamsRequest, SendEventInvitesRequest, SendEventInvitesResponse, SpeakerResponse, UpdateCategoryRequest, UpdateEventDocumentRequest, UpdateEventDocumentResponse, UpdateEventRequest } from '@app/common/types/event';
import { Observable } from 'rxjs';
import { EventCategoryService } from 'apps/event-service/src/event-category/event-category.service';
import { SpeakerService } from 'apps/event-service/src/speaker/speaker.service';
import { GuestService } from 'apps/event-service/src/guest/guest.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
@EventServiceControllerMethods()
export class EventController implements EventServiceController {
  constructor(
    private readonly eventService: EventService,
    private readonly categoryService: EventCategoryService,
    private readonly speakerService: SpeakerService,
    private readonly guestService: GuestService,
  ) { }

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

