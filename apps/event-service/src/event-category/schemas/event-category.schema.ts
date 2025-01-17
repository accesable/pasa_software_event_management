import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = EventCategory & Document;

@Schema({ versionKey: false })
export class EventCategory {
    @Prop({ required: true, trim: true, index: true })
    name: string;

    @Prop({ trim: true, default: '' })
    description: string;
}

export const EventCategorySchema = SchemaFactory.createForClass(EventCategory);