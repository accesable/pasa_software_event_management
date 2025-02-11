import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
// import * as QRCode from 'qrcode';
import { UsersServiceClient, USERS_SERVICE_NAME, QueryParamsRequest } from '../../../libs/common/src';
import { handleRpcException } from '../../../libs/common/src/filters/handleException';
import { EVENT_SERVICE_NAME, EventServiceClient } from '../../../libs/common/src/types/event';
import { ScanTicketResponse, CreateParticipationRequest, Participation, TicketType, GetParticipantIdByUserIdEventIdRequest } from '../../../libs/common/src/types/ticket';
import { EVENT_SERVICE, AUTH_SERVICE } from '../../apigateway/src/constants/service.constant';
import { Participant, ParticipantDocument } from './schemas/participant';
import { Ticket, TicketDocument } from './schemas/ticket';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class TicketServiceService implements OnModuleInit {
  private eventService: EventServiceClient;
  private authService: UsersServiceClient;

  constructor(
    @Inject(EVENT_SERVICE) private client: ClientGrpc,
    @Inject(AUTH_SERVICE) private clientAuth: ClientGrpc,
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Participant.name) private participantModel: Model<ParticipantDocument>,
    private configService: ConfigService,
    @Inject('EVENT_SERVICE_RABBIT') private readonly clientEvent: ClientProxy,
  ) { }

  onModuleInit() {
    this.eventService = this.client.getService<EventServiceClient>(EVENT_SERVICE_NAME);
    this.authService = this.clientAuth.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  async getParticipantOfUser(request: QueryParamsRequest) {
    try {
      const { filter = {}, limit, sort } = aqp(request.query);
      const page = parseInt(filter.page, 10);
      delete filter.page;

      const skip = page && limit ? (page - 1) * limit : 0;

      if (filter.userId) {
        filter.userId = filter.userId.toString();
      }

      // Lọc participant theo eventId và các điều kiện khác (nếu có)
      const query = {
        ...filter
      };

      const totalItems = await this.participantModel.countDocuments(query);
      const totalPages = limit ? Math.ceil(totalItems / limit) : 1;

      const participants = await this.participantModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort as any)
        .exec();

      const result = participants.map((participant) => ({
        eventId: participant.eventId.toString(),
      }));
      return result;
    } catch (error) {
      throw handleRpcException(error, 'Failed to get participants');
    }
  }

  async scanTicket(code: string): Promise<ScanTicketResponse> {
    try {
      const ticket = await this.ticketModel.findOne({ code: code });
      if (!ticket) {
        throw new RpcException({
          message: 'Ticket is invalid',
          code: HttpStatus.NOT_FOUND,
        });
      }

      const ticketStatus = ticket.status.toUpperCase();

      if (ticketStatus === 'ACTIVE') { // -- [CHECK-IN LOGIC - LẦN SCAN ĐẦU TIÊN] --
        const participant = await this.participantModel.findByIdAndUpdate(
          ticket.participantId,
          { checkinAt: new Date() },
          { new: true }
        );
        if (!participant) {
          throw new RpcException({
            message: 'Associated participant not found',
            code: HttpStatus.NOT_FOUND,
          });
        }
        ticket.status = 'CHECKED_IN';
        await ticket.save();

        const userInfo = await this.authService.findById({ id: participant.userId }).toPromise();
        if (!userInfo) {
          throw new RpcException({
            message: 'User information not found',
            code: HttpStatus.NOT_FOUND,
          });
        }

        const result = {
          eventId: participant.eventId,
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber || '',
          checkInAt: participant.checkinAt ? participant.checkinAt.toISOString() : null,
          checkOutAt: null
        };
        return { result };
      } else if (ticketStatus === 'CHECKED_IN') {
        const participant = await this.participantModel.findById(ticket.participantId);
        if (!participant) {
          throw new RpcException({
            message: 'Associated participant not found',
            code: HttpStatus.NOT_FOUND,
          });
        }

        participant.checkoutAt = new Date();
        await participant.save();
        ticket.status = 'USED';
        ticket.usedAt = new Date();
        await ticket.save();

        const userInfo = await this.authService.findById({ id: participant.userId }).toPromise();
        if (!userInfo) {
          throw new RpcException({
            message: 'User information not found',
            code: HttpStatus.NOT_FOUND,
          });
        }
        const result = {
          eventId: participant.eventId,
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber || '',
          checkInAt: participant?.checkinAt ? participant.checkinAt.toISOString() : null,
          checkOutAt: participant?.checkoutAt ? participant.checkoutAt.toISOString() : null
        };
        return { result };
      } else if (ticketStatus === 'USED') { // -- [TICKET ĐÃ SỬ DỤNG - CÁC LẦN SCAN SAU CHECK-OUT] --
        throw new RpcException({
          message: 'Ticket has been used',
          code: HttpStatus.BAD_REQUEST,
        });
      } else if (ticketStatus === 'CANCELED') { // -- [TICKET BỊ HỦY] --
        throw new RpcException({
          message: 'Ticket has been canceled',
          code: HttpStatus.BAD_REQUEST,
        });
      } else { // -- [STATUS KHÔNG HỢP LỆ] --
        throw new RpcException({
          message: 'Ticket status is not recognized',
          code: HttpStatus.BAD_REQUEST,
        });
      }
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw handleRpcException(error, 'Failed to scan ticket');
    }
  }

  // async cancelEvent(eventId: string) {
  //   try {
  //     const participants = await this.participantModel.find({ eventId });
  //     participants.forEach(async (participant) => {
  //       this.ticketModel.findOneAndUpdate({ participantId: participant._id }, { status: 'CANCELED' });
  //       participant.status = 'CANCELED';
  //       await participant.save();
  //     });
  //   } catch (error) {
  //     throw handleRpcException(error, 'Failed to cancel event');
  //   }
  // }

  async cancelEvent(eventId: string) {
    try {
      const participants = await this.participantModel.find({ eventId });

      // Using for...of to handle async/await properly
      for (const participant of participants) {
        await this.ticketModel.findOneAndUpdate({ participantId: participant._id }, { status: 'CANCELED' });
        participant.status = 'CANCELED';
        await participant.save();
      }
    } catch (error) {
      throw handleRpcException(error, 'Failed to cancel event');
    }
  }

  async scanParticipant(code: any) {
    try {
      const participant = await this.participantModel.findById(code);
      if (participant.checkinAt !== null) {
        participant.checkoutAt = new Date();
      }
      await participant.save();
      return participant;
    } catch (error) {
      throw handleRpcException(error, 'Failed to scan participant');
    }
  }

  async createParticipant(request: CreateParticipationRequest) {
    try {
      const { eventId, userId, sessionIds } = request;
      const event = await lastValueFrom(this.eventService.getEventById({ id: eventId }));
      if (userId === event.event.createdBy.id) {
        throw new RpcException({
          message: 'You can not register your own event',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      if (event.event.status === 'CANCELED' || event.event.status === 'FINISHED') {
        throw new RpcException({
          message: 'Event has been canceled or finished',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      if (event.event.maxParticipants === 0) {
        throw new RpcException({
          message: 'Event is full',
          code: HttpStatus.BAD_REQUEST,
        });
      }

      const isExist = await this.participantModel.findOne({ eventId, userId });
      if (isExist) {
        throw new RpcException({
          message: 'Ticket already exist',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      const participant = await this.participantModel.create({
        eventId,
        userId,
        sectionIds: sessionIds,
        status: 'REGISTERED'
      });
      // const baseUrl = this.configService.get<string>('BASE_URL');
      const code = `${participant._id}`;
      // const url = `${baseUrl}/tickets/scan?code=${code}`;
      const url = `${code}`;

      const ticket = await this.ticketModel.create({ participantId: participant._id.toString(), qrCodeUrl: url, code });
      this.clientEvent.emit('ticket_created', { eventId: request.eventId });
      return {
        participation: this.transformParticipant(participant),
        ticket: this.transformTicket(ticket),
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to create participant');
    }
  }

  async getParticipantByEventAndUser(request: { eventId: string, userId: string }) {
    try {
      const participant = await this.participantModel.findOne({ eventId: request.eventId, userId: request.userId });
      if (!participant) {
        throw new RpcException({
          message: 'Participant not found',
          code: HttpStatus.NOT_FOUND,
        });
      }
      const ticket = await this.ticketModel.findOne({ participantId: participant._id });
      return {
        participation: this.transformParticipant(participant),
        ticket: this.transformTicket(ticket),
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get participant by event and user');
    }
  }

  async getParticipantById(id: string): Promise<Participant> {
    try {
      const participant = await this.participantModel.findById(id);
      if (!participant) {
        throw new RpcException({
          message: 'Participant not found',
          code: HttpStatus.NOT_FOUND,
        });
      }
      return participant;
    } catch (error) {
      throw handleRpcException(error, 'Failed to get participant by ID');
    }
  }

  async deleteParticipant(id: string) {
    try {
      const participant = await this.participantModel.findById(id);
      if (!participant) {
        throw new RpcException({
          message: 'Participant not found',
          code: HttpStatus.NOT_FOUND,
        });
      }
      await this.participantModel.findByIdAndDelete(id);
      await this.ticketModel.findOneAndDelete({ participantId: id });
      this.clientEvent.emit('ticket_deleted', { eventId: participant.eventId });
      return {
        message: 'Participant deleted successfully',
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to delete participant');
    }
  }

  async getTicketByParticipantId(participantId: string) {
    try {
      const ticket = await this.ticketModel.findOne({ participantId: participantId });
      if (!ticket) {
        throw new RpcException({
          message: 'Ticket not found for participant id',
          code: HttpStatus.NOT_FOUND,
        });
      }
      return { ticket: this.transformTicket(ticket) };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get ticket by participant id');
    }
  }

  async getParticipantByEventId(eventId: string) {
    try {
      const participants = await this.participantModel.find(
        { eventId, checkinAt: { $ne: null } }, // Lọc những người có checkinAt không null
        { userId: 1, eventId: 1, checkinAt: 1, checkoutAt: 1 }
      );
      const userIDs = participants.map((participant) => participant.userId);
      const usersResponse = await this.authService.findUsersByIds({ ids: userIDs }).toPromise();
      const users = usersResponse.users;
      const response = participants.map((participant) => {
        const user = users.find((u) => u.id === participant.userId);

        return {
          eventId: participant.eventId,
          id: participant._id.toString(),
          email: user?.email || '',
          name: user?.name || '',
          phoneNumber: user?.phoneNumber || null,
          checkInAt: participant.checkinAt ? participant.checkinAt.toISOString() : null,
          checkOutAt: participant.checkoutAt ? participant.checkoutAt.toISOString() : null,
          participantId: participant._id.toString(),
          createdAt: participant?.createdAt ? participant.createdAt.toISOString() : null,
        };
      });

      return { participants: response };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get participant by event ID');
    }
  }

  async getParticipantIdByUserIdEventId(request: GetParticipantIdByUserIdEventIdRequest) { // New service function implementation
    try {
      const { userId, eventId } = request;
      const participant = await this.participantModel.findOne({ userId: userId, eventId: eventId }); // Find participant by userId and eventId
      if (!participant) {
        throw new RpcException({
          message: 'Participant not found for user and event id',
          code: HttpStatus.NOT_FOUND,
        });
      }
      return { participantId: participant.id }; // Return participantId
    } catch (error) {
      throw handleRpcException(error, 'Failed to get participant id by user and event id');
    }
  }

  async getUserParticipationByEventId(eventId: string) {
    try {
      // Lấy danh sách participant theo eventId
      const participants = await this.participantModel.find({ eventId });
      if (!participants || participants.length === 0) {
        return { participants: [] };
      }
      const userIDs = participants.map((participant) => participant.userId);
      if (!userIDs || userIDs.length === 0) {
        return { participants: [] };
      }
      // Gọi authService để lấy thông tin user dựa trên danh sách userIDs
      const usersResponse = await this.authService.findUsersByIds({ ids: userIDs }).toPromise();
      const users = (usersResponse && usersResponse.users) ? usersResponse.users : [];
      const response = participants.map((participant) => {
        const user = users.find((u) => u.id === participant.userId);
        return {
          email: user?.email || '',
          name: user?.name || '',
        };
      });
      return { participants: response };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get user participation by event ID');
    }
  }


  async getAllTicket(request: any) {
    try {
      const { filter, limit, sort } = aqp(request.query);

      const page = parseInt(filter.page, 10);
      delete filter.page;

      const parsedLimit = limit;
      const skip = (page - 1) * parsedLimit;

      const totalItems = await this.ticketModel.countDocuments(filter);
      const totalPages = Math.ceil(totalItems / parsedLimit);
      const tickets = await this.ticketModel
        .find(filter)
        .skip(skip)
        .limit(parsedLimit)
        .sort(sort as any)
        // .populate(population) // "guestIds", "categoryId", "schedule.speakerIds"
        .exec();

      const ticketResponses = tickets.map((ticket) => this.transformTicket(ticket));

      return {
        meta: {
          page,
          limit: parsedLimit,
          totalPages,
          totalItems,
          count: tickets.length,
        },
        tickets: ticketResponses,
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get all ticket');
    }
  }

  async updateParticipant(request: CreateParticipationRequest) {
    try {
      const { eventId, userId, sessionIds } = request;
      const participant = await this.participantModel.findOne({ eventId, userId });
      if (!participant) {
        throw new RpcException({
          message: 'Participant not found',
          code: HttpStatus.NOT_FOUND,
        });
      }
      participant.sectionIds = sessionIds;
      await participant.save();
      const ticket = await this.ticketModel.findOne({ participantId: participant._id });
      return {
        participation: this.transformParticipant(participant),
        ticket: this.transformTicket(ticket),
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to update participant');
    }
  }

  transformParticipant(participant: ParticipantDocument): Participation {
    return {
      id: participant._id.toString(),
      eventId: participant.eventId,
      userId: participant.userId,
      sessionIds: participant.sectionIds,
      status: participant.status,
      createdAt: participant?.createdAt ? participant.createdAt.toISOString() : null,
      updatedAt: participant?.updatedAt ? participant.updatedAt.toISOString() : null,
      checkedInAt: participant.checkinAt ? participant.checkinAt.toISOString() : null,
      checkedOutAt: participant.checkoutAt ? participant.checkoutAt.toISOString() : null,
    };
  }

  transformTicket(ticket: TicketDocument): TicketType {
    return {
      id: ticket._id.toString(),
      participantId: ticket.participantId,
      qrCodeUrl: ticket.qrCodeUrl,
      status: ticket.status,
      usedAt: ticket.usedAt ? ticket.usedAt.toISOString() : null,
    };
  }
}
