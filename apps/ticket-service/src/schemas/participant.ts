import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ParticipantDocument = Participant & Document;

@Schema({ timestamps: true, versionKey: false })
export class Participant {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({ default: 'REGISTERED', enum: ['REGISTERED', 'CANCELLED', 'COMPLETED'] })
  status: string;

  @Prop()
  registeredAt: Date;

  @Prop({ type: [String], default: [] })
  sectionIds: string[];

  @Prop({ default: false })
  isVolunteer: boolean;

  @Prop()
  canceledAt: Date;

  @Prop()
  checkinAt: Date;

  @Prop()
  checkoutAt: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
ParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });