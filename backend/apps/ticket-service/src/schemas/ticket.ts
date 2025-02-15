import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Participant } from './participant';

export type TicketDocument = Ticket & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Ticket {
  @Prop({ required: true })
  participantId: string;

  @Prop({ required: true })
  code: string;

  @Prop()
  qrCodeUrl: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'CANCELED', 'USED', 'CHECKED_IN'] })
  status: string;

  @Prop()
  usedAt: Date;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
TicketSchema.index({ code: 1 }, { unique: true });
TicketSchema.index({ participantId: 1 });