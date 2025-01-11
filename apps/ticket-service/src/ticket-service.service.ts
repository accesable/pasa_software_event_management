import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Model } from 'mongoose';
import * as QRCode from 'qrcode';
import { UsersServiceClient, USERS_SERVICE_NAME } from '../../../libs/common/src';
import { handleRpcException } from '../../../libs/common/src/filters/handleException';
import { EVENT_SERVICE_NAME, EventServiceClient } from '../../../libs/common/src/types/event';
import { ScanTicketResponse, CreateParticipationRequest, Participation, TicketType } from '../../../libs/common/src/types/ticket';
import { EVENT_SERVICE, AUTH_SERVICE } from '../../apigateway/src/constants/service.constant';
import { Participant, ParticipantDocument } from './schemas/participant';
import { Ticket, TicketDocument } from './schemas/ticket';

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

  async scanTicket(code: string): Promise<ScanTicketResponse> {
    try {
      const ticket = await this.ticketModel.findOne({ code });
      if (!ticket) {
        throw new RpcException({
          message: 'Ticket is invalid',
          code: HttpStatus.NOT_FOUND,
        });
      }
      if (ticket.status === 'ACTIVE') {
        const participant = await this.participantModel.findByIdAndUpdate(ticket.participantId, { checkinAt: new Date() }, { new: true });
        ticket.status = 'USED';
        ticket.usedAt = new Date();
        await ticket.save();
        const userInfo = await this.authService.findById({ id: participant.userId }).toPromise();

        const result = {
          eventId: participant.eventId,
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          phoneNumber: userInfo.phoneNumber || '',
          checkInAt: participant.checkinAt.toISOString(),
          checkOutAt: null,
        }
        return {
          result
        };
      }
      if (ticket.status === 'USED') {
        const participant = await this.participantModel.findById(ticket.participantId);
        if (!participant.checkoutAt) {
          participant.checkoutAt = new Date();
          await participant.save();

          const userInfo = await this.authService.findById({ id: participant.userId }).toPromise();

          const result = {
            eventId: participant.eventId,
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            phoneNumber: userInfo.phoneNumber || '',
            checkInAt: participant.checkinAt.toISOString(),
            checkOutAt: participant.checkoutAt.toISOString(),
          }
          return {
            result
          };
        }
        throw new RpcException({
          message: 'Ticket has been used',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      if (ticket.status === 'CANCELED') {
        throw new RpcException({
          message: 'Ticket has been canceled',
          code: HttpStatus.BAD_REQUEST,
        });
      }
    } catch (error) {
      throw handleRpcException(error, 'Failed to scan ticket');
    }
  }

  async cancelEvent(eventId: string) {
    try {
      const participants = await this.participantModel.find({ eventId });
      participants.forEach(async (participant) => {
        this.ticketModel.findOneAndUpdate({ participantId: participant._id }, { status: 'CANCELED' });
        participant.status = 'CANCELED';
        await participant.save();
      });
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
      const event = await this.eventService.getEventById({ id: eventId }).toPromise();
      if (event.event.status === 'CANCELED' || event.event.status === 'COMPLETED') {
        throw new RpcException({
          message: 'Event has been canceled or completed',
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
      const baseUrl = this.configService.get<string>('BASE_URL');
      const code = `${participant._id}`;
      const url = baseUrl + '/tickets/scan?code=' + code;
      const qrCodeUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H', // Mức sửa lỗi cao
        type: 'image/png',
        width: 300,
      });
      const ticket = await this.ticketModel.create({ participantId: participant._id, qrCodeUrl, code });
      this.clientEvent.emit('ticket_created', { eventId: request.eventId });
      return {
        participation: this.transformParticipant(participant),
        ticket: this.transformTicket(ticket),
      };
    } catch (error) {
      throw handleRpcException(error, 'Failed to create participant');
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
    // try {
    //   const participant = await this.participantModel.findById(id);
    //   if (!participant) {
    //     throw new RpcException({
    //       message: 'Participant not found',
    //       code: HttpStatus.NOT_FOUND,
    //     });
    //   }
    //   await this.participantModel.findByIdAndDelete(id);
    //   await this.ticketModel.findOneAndDelete({ participantId: id });
    //   return {
    //     message: 'Participant deleted successfully',
    //   };
    // } catch (error) {
    //   throw handleRpcException(error, 'Failed to delete participant');
    // }
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
        };
      });

      return { participants: response };
    } catch (error) {
      throw handleRpcException(error, 'Failed to get participant by event ID');
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
      createdAt: participant.createdAt.toISOString(),
      updatedAt: participant.updatedAt.toISOString(),
      checkedInAt: participant.checkinAt?.toISOString(),
      checkedOutAt: participant.checkoutAt?.toISOString(),
    };
  }

  transformTicket(ticket: TicketDocument): TicketType {
    return {
      id: ticket._id.toString(),
      participantId: ticket.participantId.toString(),
      qrCodeUrl: ticket.qrCodeUrl,
      status: ticket.status,
      usedAt: ticket.usedAt?.toISOString(),
    };
  }
}
