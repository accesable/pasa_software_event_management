import { Controller, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { CategoryByIdRequest, CategoryResponse, CreateCategoryRequest, CreateEventRequest, Empty, EventByIdRequest, EventServiceController, EventServiceControllerMethods, UpdateCategoryRequest, UpdateEventRequest } from '@app/common/types/event';
import { Observable } from 'rxjs';
import { EventCategoryService } from 'apps/event-service/src/event-category/event-category.service';

@Controller()
@EventServiceControllerMethods()
export class EventController implements EventServiceController {
  constructor(
    private readonly eventService: EventService,
    private readonly categoryService: EventCategoryService
  ) { }

  getAllEvent(request: Empty) {
    return this.eventService.getAllEvent();
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
