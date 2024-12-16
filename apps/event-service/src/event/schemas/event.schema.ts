import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EventDocument = Event & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Event {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ trim: true })
  location: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Speaker' }] })
  speaker: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Guest' }] })
  guest: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EventCategory' })
  categoryId: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: string;

  @Prop({ default: true })
  isFree: boolean;

  @Prop({ default: 0 })
  price: number;

  @Prop({ default: 50 })
  maxParticipants: number;

  @Prop()
  banner: string;

  @Prop()
  videoIntro: string;

  @Prop()
  otherDocument: string[];

  @Prop({ default: "scheduled", enum: ["scheduled", "ongoing", "canceled", "finished"] })
  status: string;
}


export const EventSchema = SchemaFactory.createForClass(Event);