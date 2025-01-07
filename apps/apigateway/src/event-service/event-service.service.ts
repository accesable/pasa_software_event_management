import { CreatedBy, CreateEventRequest, DecodeAccessResponse, EVENT_SERVICE_NAME, EventServiceClient, QueryParamsRequest, UpdateCategoryRequest, UpdateEventRequest } from '@app/common/types/event';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateEventDto } from 'apps/apigateway/src/event-service/dto/create-event-service.dto';
import { EVENT_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { CreateEventCategoryDto } from 'apps/apigateway/src/event-service/dto/create-event-category.dtc';
import { UpdateEventDto } from 'apps/apigateway/src/event-service/dto/update-event-service.dto';
import { CreateSpeakerDto } from 'apps/apigateway/src/event-service/dto/create-speaker.dto';
import { CreateGuestDto } from 'apps/apigateway/src/event-service/dto/create-guest.dto';
import { RedisCacheService } from 'apps/apigateway/src/redis/redis.service';
import { lastValueFrom, map } from 'rxjs';
import { NotificationService } from 'apps/apigateway/src/notification/notification.service';

@Injectable()
export class EventServiceService implements OnModuleInit {
  private eventService: EventServiceClient;

  constructor(
    @Inject(EVENT_SERVICE) private client: ClientGrpc,
    private readonly redisCacheService: RedisCacheService,
    @Inject('FILE_SERVICE') private readonly rabbitFile: ClientProxy
  ) { }

  onModuleInit() {
    this.eventService = this.client.getService<EventServiceClient>(EVENT_SERVICE_NAME);
  }

  async sendEventInvites(
    eventId: string,
    emails: string[],
    user: DecodeAccessResponse,
  ): Promise<any> {
    try {
      const event = await lastValueFrom(
        this.eventService.getEventById({ id: eventId }),
      );
      if (!event) {
        throw new RpcException('Event not found');
      }

      if (event.event.createdBy.id !== user.id) {
        throw new RpcException(
          'You are not authorized to send invites for this event',
        );
      }

      const payload = {
        eventId: eventId,
        emails: emails,
      };

      return lastValueFrom(
        this.eventService.sendEventInvites(payload),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  deleteFilesUrl(urls: string[], videoURl?: string) {
    console.log('deleteFilesUrl', urls, videoURl);
    this.rabbitFile.emit('delete_files_event', { urls, videoURl });
  }

  // async acceptInvitation(eventId: string, query: any) {
  //   try {
  //     const token = query.token;

  //     // Make a request to the event service to accept the invitation
  //     const acceptResult = await lastValueFrom(
  //       this.eventService.acceptInvitation({ eventId, token }),
  //     );

  //     return acceptResult;
  //   } catch (error) {
  //     // Handle errors during the invitation acceptance process
  //     throw new RpcException(error);
  //   }
  // }

  // async declineInvitation(eventId: string, query: any) {
  //   try {
  //     const token = query.token;

  //     // Make a request to the event service to decline the invitation
  //     const declineResult = await lastValueFrom(
  //       this.eventService.declineInvitation({ eventId, token }),
  //     );

  //     // Return the result of declining the invitation
  //     return declineResult;
  //   } catch (error) {
  //     // Handle errors during the invitation declination process
  //     throw new RpcException(error);
  //   }
  // }

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

  async getAllEvent(query: any) {
    try {
      const key = `getAllEvent:${JSON.stringify(query)}`;
      const cacheData = await this.redisCacheService.get<any>(key);
      if (cacheData) {
        return cacheData;
      }

      const data = await this.eventService.getAllEvent({ query }).toPromise();

      await this.redisCacheService.set(key, data, 60 * 5);
      return data;
    } catch (error) {
      throw new RpcException(error);
    }
  }


  async getEventByCategoryName(categoryName: string) {
    try {
      const key = `getEventByCategoryName:${categoryName}`;
      const cacheData = await this.redisCacheService.get<any>(key);
      if (cacheData) {
        return cacheData;
      }
      const data = await this.eventService.getAllEventByCategoryName({ name: categoryName }).toPromise();
      await this.redisCacheService.set(key, data, 60 * 5);
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

  cancelEvent(id: string, userId: string) {
    try {
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

  async updateEventVideoIntro() {

  }

  // async updateEventFiles(
  //   eventId: string,
  //   field: string,
  //   uploadedFilesInfo: any[], // Use your actual type here
  //   user: DecodeAccessResponse,
  // ): Promise<UpdateEventResponse> {
  //   // Assuming you want to associate these files with the event
  //   try {
  //     const userResponse = await lastValueFrom(
  //       this.usersService.findById({ id: user.id }),
  //     );

  //     if (!userResponse || !userResponse.id) {
  //       throw new RpcException('User not found or invalid user data');
  //     }
  //     const fileIds = uploadedFilesInfo.map((fileInfo) => fileInfo.fileId);

  //     let updateData: any = {};

  //     switch (field) {
  //       case 'banner':
  //         updateData.banner = fileIds[0]; // Assuming single file for banner
  //         break;
  //       case 'videoIntro':
  //         updateData.videoIntro = fileIds[0]; // Assuming single file for videoIntro
  //         break;
  //       case 'documents':
  //         updateData.documents = fileIds;
  //         break;
  //       default:
  //         throw new RpcException(`Invalid field: ${field}`);
  //     }

  //     return await lastValueFrom(
  //       this.eventService.updateEvent(
  //         {
  //           id: eventId,
  //           ...updateData,
  //         },
  //         userResponse,
  //       ),
  //     );
  //   } catch (error) {
  //     throw new RpcException(error);
  //   }
  // }

  // async updateEventDocument(
  //   request: UpdateEventDocumentRequest,
  // ): Promise<any> {
  //   try {
  //     const data = await this.eventService
  //       .updateEventDocument(request)
  //       .toPromise();
  //     return data;
  //   } catch (error) {
  //     throw new RpcException(error);
  //   }
  // }

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
