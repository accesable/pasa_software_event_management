import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { EventCategory } from '../../event-category/schemas/event-category.schema';
import { Guest } from '../../guest/schemas/guest.schema';
import { Speaker } from '../../speaker/schemas/speaker.schema';

export type EventDocument = Event & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Event {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({
    required: true,
    validate: {
      validator: function (this: Event, value: Date) {
        return value < this.endDate;
      },
      message: 'Start date must be earlier than end date.'
    }
  })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ trim: true })
  location: string;

  @Prop({ type: Types.ObjectId, ref: EventCategory.name, required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  createdBy: {
    id: Types.ObjectId;
    email: string;
  };

  @Prop({ default: 50 })
  maxParticipants: number;

  @Prop()
  banner: string;

  @Prop()
  videoIntro: string;

  @Prop({ type: [String] })
  documents: string[];

  @Prop({ type: [Types.ObjectId], ref: Guest.name })
  guestIds: Types.ObjectId[];

  @Prop({
    type: [{
      id: {
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
        required: true,
      },
      title: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      description: { type: String, trim: true },
      speakerIds: [{ type: Types.ObjectId, ref: Speaker.name }]
    }],
    default: []
  })
  schedule: {
    id: Types.ObjectId;
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    speakerIds: Types.ObjectId[];
  }[];

  @Prop({
    type: [Types.ObjectId],
    default: [],
  })
  invitedUsers: Types.ObjectId[];

  @Prop({
    type: [{
      name: { type: String, required: true },
      logo: { type: String },
      website: { type: String },
      contribution: { type: Number, default: 0 }
    }],
    default: []
  })
  sponsors: {
    name: string;
    logo?: string;
    website?: string;
    contribution: number;
  }[];

  @Prop({ default: 'SCHEDULED', enum: ["SCHEDULED", "CANCELED", "FINISHED"] })
  status: string;

  @Prop({ default: false })
  reminderSent: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
