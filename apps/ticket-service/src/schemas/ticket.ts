import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Participant } from './participant';

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

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'CANCELED', 'USED'] })
  status: string;

  @Prop()
  usedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.index({ code: 1 }, { unique: true });
TicketSchema.index({ participantId: 1 });