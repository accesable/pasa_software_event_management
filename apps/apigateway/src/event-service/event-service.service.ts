import { CreateEventRequest, EVENT_SERVICE_NAME, EventServiceClient, QueryParamsRequest, UpdateCategoryRequest, UpdateEventRequest } from '@app/common/types/event';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { CreateEventDto } from 'apps/apigateway/src/event-service/dto/create-event-service.dto';
import { EVENT_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { CreateEventCategoryDto } from 'apps/apigateway/src/event-service/dto/create-event-category.dtc';
import { UpdateEventDto } from 'apps/apigateway/src/event-service/dto/update-event-service.dto';
import { CreateSpeakerDto } from 'apps/apigateway/src/event-service/dto/create-speaker.dto';

@Injectable()
export class EventServiceService implements OnModuleInit {
  private eventService: EventServiceClient;
  constructor(
    @Inject(EVENT_SERVICE) private client: ClientGrpc,
  ) { }

  onModuleInit() {
    this.eventService = this.client.getService<EventServiceClient>(EVENT_SERVICE_NAME);
  }

  async getAllEvent(
    request: QueryParamsRequest
  ) {
    try {
      return await this.eventService.getAllEvent(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEventByCategoryName(categoryName: string) {
    try {
      return await this.eventService.getAllEventByCategoryName({ name: categoryName }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEventById(id: string) {
    try {
      return await this.eventService.getEventById({ id }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async createEvent(createEventDto: CreateEventDto, createdBy: string) {
    try {
      const request: CreateEventRequest = {
        name: createEventDto.name,
        description: createEventDto.description ?? '',
        startDate: createEventDto.startDate.toISOString(),
        endDate: createEventDto.endDate.toISOString(),
        location: createEventDto.location,
        guestIds: createEventDto.guestIds ?? [],
        categoryId: createEventDto.categoryId,
        isFree: createEventDto.isFree ?? true,
        price: createEventDto.price ?? 0,
        maxParticipants: createEventDto.maxParticipants ?? 50,
        banner: createEventDto.banner ?? '',
        videoIntro: createEventDto.videoIntro ?? '',
        documents: createEventDto.documents ?? [],
        createdBy,
      };

      return await this.eventService.createEvent(request).toPromise();
    } catch (error) {
      console.error('Error occurred while creating event:', error.message);
      throw new RpcException('Failed to create event. Please try again.');
    }
  }


  async createCategory(createEventCategoryDto: CreateEventCategoryDto) {
    try {
      return await this.eventService.createCategory(createEventCategoryDto).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getAllCategory() {
    try {
      return await this.eventService.getAllCategory({}).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getCategoryById(id: string) {
    try {
      return await this.eventService.getCategoryById({ id }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateCategory(id: string, createEventCategoryDto: CreateEventCategoryDto) {
    try {
      const request: UpdateCategoryRequest = {
        id,
        name: createEventCategoryDto.name,
        description: createEventCategoryDto.description ?? undefined,
      }
      return await this.eventService.updateCategory(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto) {
    try {
      const request: UpdateEventRequest = {
        id: id,
        name: updateEventDto.name ?? undefined,
        description: updateEventDto.description ?? undefined,
        startDate: updateEventDto.startDate ? updateEventDto.startDate.toISOString() : undefined,
        endDate: updateEventDto.endDate ? updateEventDto.endDate.toISOString() : undefined,
        location: updateEventDto.location ?? undefined,
        guestIds: updateEventDto.guestIds ?? undefined,
        categoryId: updateEventDto.categoryId ?? undefined,
        isFree: updateEventDto.isFree ?? undefined,
        price: updateEventDto.price ?? undefined,
        maxParticipants: updateEventDto.maxParticipants ?? undefined,
        banner: updateEventDto.banner ?? undefined,
        videoIntro: updateEventDto.videoIntro ?? undefined,
        documents: updateEventDto.documents ?? undefined,
        status: updateEventDto.status ?? undefined,
      }
      return await this.eventService.updateEvent(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getAllSpeaker(){
    try {
      return await this.eventService.getAllSpeaker({}).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async createSpeaker(createSpeakerDto: CreateSpeakerDto) {
    try {
      return await this.eventService.createSpeaker(createSpeakerDto).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
