import { handleRpcException } from '@app/common/filters/handleException';
import { CreateParticipationRequest, Participation, TicketType } from '@app/common/types/ticket';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Participant, ParticipantDocument } from 'apps/ticket-service/src/schemas/participant';
import { Ticket, TicketDocument } from 'apps/ticket-service/src/schemas/ticket';
import { Model } from 'mongoose';
import * as QRCode from 'qrcode';

@Injectable()
export class TicketServiceService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Participant.name) private participantModel: Model<ParticipantDocument>,
    private configService: ConfigService,

  ) { }

  async scanTicket(code: string) {
    try {
      const ticket = await this.ticketModel.findOne({ code });
      if (!ticket) {
        throw new RpcException({
          message: 'Ticket is invalid',
          code: HttpStatus.NOT_FOUND,
        });
      }
      if (ticket.status === 'ACTIVE') {
        await this.participantModel.findByIdAndUpdate(ticket.participantId, { checkinAt: new Date() });
        ticket.status = 'USED';
        ticket.usedAt = new Date();
        await ticket.save();
        return {
          message: 'checked in successfully',
        };
      }
      if (ticket.status === 'USED') {
        const participant = await this.participantModel.findById(ticket.participantId);
        if (!participant.checkoutAt) {
          participant.checkoutAt = new Date();
          await participant.save();
          return {
            message: 'checked out successfully',
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
        participant.updateOne({ status: 'CANCELED' });
        console.log('participant', participant);
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
      const isExist = await this.participantModel.findOne({ eventId, userId });
      if (isExist) {
        throw new RpcException({
          message: 'Participant already exist',
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
      console.log('baseUrl', baseUrl);
      const code = `${participant._id}`;
      const url = baseUrl + '/tickets/scan?code=' + code;
      const qrCodeUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H', // Mức sửa lỗi cao
        type: 'image/png',
        width: 300,
      });
      const ticket = await this.ticketModel.create({ participantId: participant._id, qrCodeUrl, code });

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

  // async updateParticipant(request: UpdateParticipantRequest) {
  //   try {
  //     const { id, status, checkedInAt, checkedOutAt } = request;
  //     const participant = await this.participantModel.findById(id);
  //     if (!participant) {
  //       throw new RpcException({
  //         message: 'Participant not found',
  //         code: HttpStatus.NOT_FOUND,
  //       });
  //     }

  //     if (status) participant.status = status;
  //     if (checkedInAt) participant.checkinAt = new Date(checkedInAt);
  //     if (checkedOutAt) participant.checkoutAt = new Date(checkedOutAt);
  //     // v.v. -> sectionIds, isVolunteer... tùy logic
  //     await participant.save();

  //     return participant;
  //   } catch (error) {
  //     throw handleRpcException(error, 'Failed to update participant');
  //   }
  // }

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
