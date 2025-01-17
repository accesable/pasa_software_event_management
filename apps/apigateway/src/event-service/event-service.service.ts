import { forwardRef, HttpStatus, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateEventDto } from './dto/create-event-service.dto';
import { EVENT_SERVICE } from '../constants/service.constant';
import { CreateEventCategoryDto } from './dto/create-event-category.dto';
import { UpdateEventDto } from './dto/update-event-service.dto';
import { CreateSpeakerDto } from './dto/create-speaker.dto';
import { CreateGuestDto } from './dto/create-guest.dto';
import { RedisCacheService } from '../redis/redis.service';
import { lastValueFrom } from 'rxjs';
import { TicketServiceService } from '../ticket-service/ticket-service.service';
import { CreatedBy, CreateEventRequest, DecodeAccessResponse, EVENT_SERVICE_NAME, EventResponse, EventServiceClient, UpdateCategoryRequest, UpdateEventRequest } from '../../../../libs/common/src/types/event';

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

  // async createQuestion(
  //   eventId: string,
  //   question: string,
  //   user: DecodeAccessResponse,
  // ) {
  //   try {
  //     // Fetch the user data based on the user's ID
  //     const userResponse = await lastValueFrom(
  //       this.usersService.findById({ id: user.id }),
  //     );

  //     // If user data is not found or the ID is missing, throw an exception
  //     if (!userResponse || !userResponse.id) {
  //       throw new RpcException('User not found or invalid user data');
  //     }
  //     // Make a request to the event service to create a question
  //     const result = await lastValueFrom(
  //       this.eventService.createQuestion({
  //         eventId,
  //         question,
  //         userId: userResponse.id, // Pass the user ID from the authenticated user
  //       }),
  //     );

  //     return result;
  //   } catch (error) {
  //     // Throw any errors that occur during the process
  //     throw new RpcException(error);
  //   }
  // }

  // async getEventQuestions(eventId: string) {
  //   try {
  //     // Make a request to the event service to get all questions for the event
  //     const result = await lastValueFrom(
  //       this.eventService.getEventQuestions({
  //         eventId,
  //       }),
  //     );

  //     return result;
  //   } catch (error) {
  //     throw new RpcException(error);
  //   }
  // }

  // async updateQuestion(
  //   eventId: string,
  //   questionId: string,
  //   answered: boolean,
  //   user: DecodeAccessResponse,
  // ) {
  //   try {
  //     const userResponse = await lastValueFrom(
  //       this.usersService.findById({ id: user.id }),
  //     );

  //     if (!userResponse || !userResponse.id) {
  //       throw new RpcException('User not found or invalid user data');
  //     }
  //     const event = await this.eventService.getEventById({ id: eventId }).toPromise();

  //     // Check if the user is authorized to update this question
  //     if (event.createdBy.id !== userResponse.id) {
  //       throw new RpcException(
  //         'You are not authorized to update questions for this event',
  //       );
  //     }
  //     const result = await lastValueFrom(
  //       this.eventService.updateQuestion({
  //         questionId,
  //         answered,
  //       }),
  //     );
  //     return result;
  //   } catch (error) {
  //     throw new RpcException(error);
  //   }
  // }

  // async getEventParticipationReport(eventId: string) {
  //   try {
  //     // Assuming you have a method in your event service to fetch the participation report
  //     const report = await lastValueFrom(
  //       this.eventService.getEventParticipationReport({ eventId }),
  //     );
  //     return report;
  //   } catch (error) {
  //     console.error('Failed to fetch event participation report:', error);
  //     throw new RpcException({
  //       code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: 'Failed to fetch participation report',
  //     });
  //   }
  // }

  // async getEventAttendanceList(eventId: string) {
  //   try {
  //     // Assuming you have a method in your event service to fetch the attendance list
  //     const attendanceList = await lastValueFrom(
  //       this.eventService.getEventAttendanceList({ eventId }),
  //     );
  //     return attendanceList;
  //   } catch (error) {
  //     console.error('Failed to fetch event attendance list:', error);
  //     throw new RpcException({
  //       code: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: 'Failed to fetch attendance list',
  //     });
  //   }
  // }
  // async getUserParticipation(userId: string) {
  //   try {
  //     const user = await lastValueFrom(
  //       this.usersService.findById({
  //         id: userId,
  //       }),
  //     );

  //     // Ensure that the user exists and has the necessary properties
  //     if (!user || !user.id) {
  //       throw new NotFoundException('User not found or user ID missing');
  //     }
  //     return lastValueFrom(this.eventService.getUserParticipation({ userId }));
  //   } catch (error) {
  //     throw new RpcException(error);
  //   }
  // }

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

  // danh sách check in check out của sự kiện
  async getParticipantsEvent(eventId: string) {
    try {
      const cacheKey = `event:${eventId}:checkInOut`;
      const cacheData = await this.redisCacheService.get<any>(cacheKey);
      if (cacheData) {
        return cacheData;
      }
      const result = await this.ticketService.getParticipantByEventId(eventId);
      await this.redisCacheService.set(cacheKey, result);
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
      console.error('Error occurred while creating event:', error.message);
      throw new RpcException('Failed to create event. Please try again.');
    }
  }

  async cancelEvent(id: string, userId: string) {
    try {
      await this.isExistEvent(id);
      return this.eventService.cancelEvent({ id, userId }).toPromise();
    } catch (error) {
      throw new RpcException(error);
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

  async getAllSpeaker() {
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

  async getAllGuest() {
    try {
      return await this.eventService.getAllGuest({}).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }

  async createGuest(createGuestDto: CreateGuestDto) {
    try {
      return await this.eventService.createGuest(createGuestDto).toPromise();
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
