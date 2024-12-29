import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Participant } from 'apps/ticket-service/src/schemas/participant';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Ticket {
  @Prop({ required: true, type: Types.ObjectId, ref: Participant.name })
  participantId: Types.ObjectId;

  @Prop({ required: true })
  code: string;

  @Prop()
  qrCodeUrl: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'CANCELLED', 'USED'] })
  status: string;

  @Prop()
  usedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.index({ code: 1 }, { unique: true });
TicketSchema.index({ participantId: 1 });