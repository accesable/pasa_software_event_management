import { handleRpcException } from '@app/common/filters/handleException';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Participant, ParticipantDocument } from 'apps/ticket-service/src/schemas/participant';
import { Ticket, TicketDocument } from 'apps/ticket-service/src/schemas/ticket';
import { Model } from 'mongoose';

@Injectable()
export class TicketServiceService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<TicketDocument>,
    @InjectModel(Participant.name) private participantModel: Model<ParticipantDocument>,
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async createParticipant(request: any) {
    try {
      const isExist = await this.participantModel.findOne({ eventId: request.eventId, userId: request.userId });
      if (isExist) {
        throw new RpcException({
          message: 'Participant already exist',
          code: HttpStatus.BAD_REQUEST,
        });
      }
      const participant = await this.participantModel.create(request);
      const code = Math.random().toString(36).substring(7);
      const qrCodeUrl = 
      this.ticketModel.create({ participantId: participant._id });
    } catch (error) {
      throw handleRpcException(error, 'Failed to create participant');
    }
  }
}
