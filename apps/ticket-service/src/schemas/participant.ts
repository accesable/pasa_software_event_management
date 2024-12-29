import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ParticipantDocument = Participant & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Participant {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  eventId: string;

  @Prop({
    default: 'INVITED',
    enum: ['INVITED', 'REGISTERED', 'CANCELED', 'COMPLETED'],
  })
  status: string;

  @Prop({ type: [String], default: [] })
  sectionIds: string[];

  @Prop({ default: false })
  isVolunteer: boolean;

  @Prop()
  checkinAt: Date;

  @Prop()
  checkoutAt: Date;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
ParticipantSchema.index({ eventId: 1, userId: 1 }, { unique: true });