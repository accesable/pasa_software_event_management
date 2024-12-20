import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ trim: true })
  location: string;

  @Prop({ type: Types.ObjectId, ref: 'EventCategory', required: true })
  categoryId: string;

  @Prop({ required: true })
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

  @Prop({ type: [String] })
  documents: string[];

  @Prop({ type: [String] })
  guestIds: string[];

  @Prop({
    type: [{
      title: { type: String, required: true },
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
      description: { type: String, trim: true },
      speakerIds: { type: [String], default: [] }
    }],
    default: []
  })
  schedule: {
    title: string;
    startTime: Date;
    endTime: Date;
    description?: string;
    speakerIds: string[];
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
