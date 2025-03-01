import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateEventDto } from './dto/create-event-service.dto';
import { EVENT_SERVICE } from '../constants/service.constant';
import { CreateEventCategoryDto, UpdateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventDto } from './dto/update-event-service.dto';
import { CreateSpeakerDto, UpdateSpeakerDto } from './dto/create-speaker.dto';
import { CreateGuestDto, UpdateGuestDto } from './dto/create-guest.dto';
import { RedisCacheService } from '../redis/redis.service';
import { lastValueFrom, from } from 'rxjs';
import { TicketServiceService } from '../ticket-service/ticket-service.service';
import { CreatedBy, CreateEventRequest, DecodeAccessResponse, EVENT_SERVICE_NAME, EventRegistrationsOverTimeResponse, EventResponse, EventServiceClient, UpdateCategoryRequest, UpdateEventRequest } from '../../../../libs/common/src/types/event';
import { DashboardStatsDto } from './dto/dashboard-stats.dto';
import { GetDetailedParticipantListRequest } from '../../../../libs/common/src/types/ticket';

@Injectable()
export class EventServiceService implements OnModuleInit {
  private eventService: EventServiceClient;

  constructor(
    @Inject(EVENT_SERVICE) private client: ClientGrpc,
    private readonly redisCacheService: RedisCacheService,
    @Inject(forwardRef(() => TicketServiceService))
    private readonly ticketService: TicketServiceService,
    @Inject('FILE_SERVICE') private readonly rabbitFile: ClientProxy
  ) { }

  onModuleInit() {
    this.eventService = this.client.getService<EventServiceClient>(EVENT_SERVICE_NAME);
  }

  async getRegisteredParticipants(eventId: string) {
    try {
      return await lastValueFrom(
        this.eventService.getRegisteredParticipants({ id: eventId })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getParticipantsWithFaces(eventId: string) {
    try {
      return await lastValueFrom(
        this.eventService.getParticipantsWithFaces({ id: eventId })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEventComparisonData() { // <-- Thêm function này
    const cacheKey = 'eventComparisonData';
    try {
      const cachedResult = await this.redisCacheService.get<any>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
      const result = await lastValueFrom(
        this.eventService.getEventComparisonData({})
      );
      await this.redisCacheService.set(cacheKey, result, 300); // cache for 300 seconds
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEventRegistrationsOverTime(eventId: string): Promise<EventRegistrationsOverTimeResponse> {
    try {
      return await lastValueFrom(
        this.eventService.getEventRegistrationsOverTime({ id: eventId })
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getTotalEventsOverTime(userId: string) {
    try {
      const cacheKey = `totalEventsOverTime:${userId}`;
      const cachedResult = await this.redisCacheService.get<any>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }
      const result = await lastValueFrom(
        this.eventService.getTotalEventsOverTime({ userId })
      );
      await this.redisCacheService.set(cacheKey, result, 300);
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getDashboardStats(userId: string): Promise<DashboardStatsDto> {
    const [
      organizedEvents,
      participatedEvents,
      // eventFeedbacks,
      createdGuests,
      createdSpeakers,
      allCategories,
      allEvents,
    ] = await Promise.all([
      this.getOrganizedEvents(userId),
      this.getParticipatedEvents(userId),
      // this.getEventFeedbacks('your-event-id-placeholder'),
      this.getAllGuest(userId),
      this.getAllSpeaker(userId),
      this.getAllCategory(),
      this.getAllEvent({ query: {} }),
    ]);

    const dashboardStatsDto = new DashboardStatsDto();
    dashboardStatsDto.organizedEventsCount = organizedEvents.meta.totalItems;
    dashboardStatsDto.participatedEventsCount = participatedEvents.meta.totalItems;
    // dashboardStatsDto.receivedFeedbacksCount = eventFeedbacks.feedbacks ? eventFeedbacks.feedbacks.length : 0; // **Cần sửa logic này**
    dashboardStatsDto.createdGuestsCount = createdGuests.meta.totalItems;
    dashboardStatsDto.createdSpeakersCount = createdSpeakers.meta.totalItems;
    dashboardStatsDto.totalEventCategoriesCount = allCategories.meta.totalItems;
    dashboardStatsDto.totalEventsCount = allEvents.meta.totalItems;

    return dashboardStatsDto;
  }

  async createQuestion(eventId: string, userId: string, text: string) {
    try {
      return await this.eventService.createQuestion({ eventId, userId, text }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async answerQuestion(questionId: string, userId: string, text: string) {
    try {
      return await this.eventService.answerQuestion({ questionId, userId, text }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEventQuestions(eventId: string) {
    try {
      return await this.eventService.getEventQuestions({ id: eventId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async submitFeedback(eventId: string, userId: string, rating: number, comment: string) {
    try {
      return await this.eventService.submitFeedback({ eventId, userId, rating, comment }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getFeedbackByUser(eventId: string, userId: string) {
    try {
      return await this.eventService.getFeedbackByUser({ eventId, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateFeedback(eventId: string, userId: string, rating: number, comment: string) {
    try {
      return await this.eventService.updateFeedback({ eventId, userId, rating, comment }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getEventFeedbacks(eventId: string) {
    try {
      return await this.eventService.getEventFeedbacks({
        eventId,
        query: undefined
      }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getFeedbackAnalysis(eventId: string) {
    try {
      return await this.eventService.getFeedbackAnalysis({ id: eventId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async isExistEvent(id: string) {
    try {
      const event = await this.eventService.getEventById({ id }).toPromise();
      return { isExist: !!event };
    } catch (error) {
      if (error.code === HttpStatus.NOT_FOUND) {
        return { isExist: false };
      }
      throw new RpcException(error);
    }
  }

  async sendEventInvites(
    users: { email: string; id: string }[],
    event: EventResponse,
  ): Promise<any> {
    try {
      const payload = {
        users: users,
        event: event,
      };
      return lastValueFrom(
        this.eventService.sendEventInvites(payload),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  deleteFilesUrl(urls: string[], videoURl?: string) {
    this.rabbitFile.emit('delete_files_event', { urls, videoURl });
  }

  async acceptInvitation(eventId: string, query: any) {
    try {
      const token = query.token;
      const acceptResult = await lastValueFrom(
        this.eventService.acceptInvitation({ eventId, token }),
      );
      return acceptResult;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async declineInvitation(eventId: string, query: any) {
    try {
      const token = query.token;
      const declineResult = await lastValueFrom(
        this.eventService.declineInvitation({ eventId, token }),
      );
      return declineResult;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getOrganizedEvents(userId: string, status?: string) {
    try {
      return await this.eventService.getOrganizedEvents({ userId, status }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // danh sách sự kiên đã tham gia của user
  async getParticipatedEvents(userId: string, status?: string) {
    try {
      return await this.eventService.getParticipatedEvents({ userId, status }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getParticipantByEventAndUser(eventId: string, userId: string) {
    try {
      return await this.ticketService.getParticipantByEventAndUser({ eventId, userId })
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // danh sách check in check out của sự kiện
  async getParticipantsEvent(eventId: string) {
    try {
      const result = await this.ticketService.getParticipantByEventId(eventId);
      return result;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getAllEvent(query: any) {
    try {
      const key = `getAllEvent:${JSON.stringify(query)}`;
      // const cacheData = await this.redisCacheService.get<any>(key);
      // if (cacheData) {
      //   return cacheData;
      // }

      const data = await this.eventService.getAllEvent({ query }).toPromise();

      // await this.redisCacheService.set(key, data, 60 * 5);
      return data;
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

  async createEvent(createEventDto: CreateEventDto, createdBy: CreatedBy) {
    try {
      const scheduleProto = createEventDto.schedule?.map(s => ({
        title: s.title,
        startTime: s.startTime.toString(),
        endTime: s.endTime.toString(),
        description: s.description || '',
        speakerIds: s.speakerIds
      })) || [];

      const sponsorsProto = createEventDto.sponsors?.map(s => ({
        name: s.name,
        logo: s.logo || '',
        website: s.website || '',
        contribution: s.contribution || 0,
      })) || [];

      const request: CreateEventRequest = {
        name: createEventDto.name,
        description: createEventDto.description ?? '',
        startDate: createEventDto.startDate.toISOString(),
        endDate: createEventDto.endDate.toISOString(),
        location: createEventDto.location,
        guestIds: createEventDto.guestIds ?? [],
        categoryId: createEventDto.categoryId,
        maxParticipants: createEventDto.maxParticipants ?? 50,
        banner: createEventDto.banner ?? '',
        videoIntro: createEventDto.videoIntro ?? '',
        documents: createEventDto.documents ?? [],
        createdBy,
        schedule: scheduleProto,
        sponsors: sponsorsProto,
      };
      return await this.eventService.createEvent(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async cancelEvent(id: string, userId: string) {
    try {
      return this.eventService.cancelEvent({ id, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async createCategory(createEventCategoryDto: CreateEventCategoryDto) {
    try {
      return await this.eventService.createCategory({ ...createEventCategoryDto }).toPromise();
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

  async updateCategory(id: string, createEventCategoryDto: UpdateEventCategoryDto) {
    try {
      const request: UpdateCategoryRequest = {
        id,
        name: createEventCategoryDto.name,
        description: createEventCategoryDto.description ?? undefined
      }
      return await this.eventService.updateCategory(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto) {
    try {
      const scheduleProto = updateEventDto.schedule?.map(s => ({
        title: s.title,
        startTime: s.startTime.toString(),
        endTime: s.endTime.toString(),
        description: s.description || '',
        speakerIds: s.speakerIds
      })) || [];

      const sponsorsProto = updateEventDto.sponsors?.map(s => ({
        name: s.name,
        logo: s.logo || '',
        website: s.website || '',
        contribution: s.contribution || 0,
      })) || [];

      const budgetProto = updateEventDto.budget ? {
        totalBudget: updateEventDto.budget.totalBudget || 0,
        expenses: updateEventDto.budget.expenses?.map(e => ({
          desc: e.desc || '',
          amount: e.amount || 0,
          date: e.date ? e.date.toISOString() : ''
        })) || [],
        revenue: updateEventDto.budget.revenue?.map(r => ({
          desc: r.desc || '',
          amount: r.amount || 0,
          date: r.date ? r.date.toISOString() : ''
        })) || []
      } : { totalBudget: 0, expenses: [], revenue: [] };

      const request: UpdateEventRequest = {
        id: id,
        name: updateEventDto.name ?? undefined,
        description: updateEventDto.description ?? undefined,
        startDate: updateEventDto.startDate ? updateEventDto.startDate.toISOString() : undefined,
        endDate: updateEventDto.endDate ? updateEventDto.endDate.toISOString() : undefined,
        location: updateEventDto.location ?? undefined,
        guestIds: updateEventDto.guestIds ?? undefined,
        categoryId: updateEventDto.categoryId ?? undefined,
        maxParticipants: updateEventDto.maxParticipants ?? undefined,
        banner: updateEventDto.banner ?? undefined,
        videoIntro: updateEventDto.videoIntro ?? undefined,
        documents: updateEventDto.documents ?? undefined,
        status: updateEventDto.status ?? undefined,
        sponsors: sponsorsProto,
        budget: budgetProto,
        schedule: scheduleProto,
        invitedUsers: []
      }
      return await this.eventService.updateEvent(request).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async checkOwnership(eventId: string, userId: string) {
    try {
      return await this.eventService.checkOwnerShip({ eventId, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getSpeakerById(id: string) {
    try {
      return await this.eventService.getSpeakerById({ id }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateSpeaker(id: string, createSpeakerDto: UpdateSpeakerDto, userId: string) {
    try {
      return await this.eventService.updateSpeaker({ id, ...createSpeakerDto, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getAllSpeaker(userId: string) {
    try {
      return await this.eventService.getAllSpeaker({ userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async createSpeaker(createSpeakerDto: CreateSpeakerDto, userId: string) {
    try {
      return await this.eventService.createSpeaker({ ...createSpeakerDto, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async updateGuest(id: string, createGuestDto: UpdateGuestDto, userId: string) {
    try {
      return await this.eventService.updateGuest({ id, ...createGuestDto, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getGuestById(id: string) {
    try {
      return await this.eventService.getGuestById({ id }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async getAllGuest(userId: string) {
    try {
      return await this.eventService.getAllGuest({ userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async createGuest(createGuestDto: CreateGuestDto, userId: string) {
    try {
      return await this.eventService.createGuest({ ...createGuestDto, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
