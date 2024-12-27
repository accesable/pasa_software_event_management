import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EventCategory } from 'apps/event-service/src/event-category/schemas/event-category.schema';
import { Guest } from 'apps/event-service/src/guest/schemas/guest.schema';
import { Speaker } from 'apps/event-service/src/speaker/schemas/speaker.schema';
import { Document, Types } from 'mongoose';

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
    name: string;
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
      title: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      description: { type: String, trim: true },
      speakerIds: [{ type: Types.ObjectId, ref: Speaker.name }]
    }],
    default: []
  })
  schedule: {
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    speakerIds: Types.ObjectId[];
  }[];

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

  @Prop({
    type: {
      totalBudget: { type: Number, default: 0 },
      expenses: [{
        desc: { type: String },
        amount: { type: Number, default: 0 },
        date: { type: Date }
      }],
      revenue: [{
        desc: { type: String },
        amount: { type: Number, default: 0 },
        date: { type: Date }
      }]
    },
    default: {}
  })
  budget: {
    totalBudget: number;
    expenses: { desc?: string; amount?: number; date?: Date; }[];
    revenue: { desc?: string; amount?: number; date?: Date; }[];
  };

  @Prop({ default: 'scheduled', enum: ["scheduled", "ongoing", "canceled", "finished"] })
  status: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
