import { Controller } from '@nestjs/common';
import { EventService } from './event.service';
import { AllEventResponse, AllGuestResponse, AllSpeakerResponse, CategoryByIdRequest, CategoryNameRequest, CategoryResponse, CreateCategoryRequest, CreateEventRequest, CreateGuestRequest, CreateSpeakerRequest, Empty, EventByIdRequest, EventServiceController, EventServiceControllerMethods, GuestResponse, QueryParamsRequest, SpeakerResponse, UpdateCategoryRequest, UpdateEventRequest } from '@app/common/types/event';
import { Observable } from 'rxjs';
import { EventCategoryService } from 'apps/event-service/src/event-category/event-category.service';
import { SpeakerService } from 'apps/event-service/src/speaker/speaker.service';
import { GuestService } from 'apps/event-service/src/guest/guest.service';

@Controller()
@EventServiceControllerMethods()
export class EventController implements EventServiceController {
  constructor(
    private readonly eventService: EventService,
    private readonly categoryService: EventCategoryService,
    private readonly speakerService: SpeakerService,
    private readonly guestService: GuestService,
  ) { }

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
    return this.eventService.getEventById(request.id);
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

