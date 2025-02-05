import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuestionDocument = Question & Document & 
{
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
  eventId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  answers: {
    userId: Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
