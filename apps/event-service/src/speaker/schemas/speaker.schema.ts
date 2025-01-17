import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SpeakerDocument = Speaker & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Speaker {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, trim: true })
    bio: string;

    @Prop({ trim: true, default: 'https://www.facebook.com'})
    linkFb: string;

    @Prop({ trim: true, default: 'https://res.cloudinary.com/dbvyexitw/image/upload/v1734692314/gtpu0cco23s7yy5moa3e.png' })
    avatar: string;

    @Prop({required: true, trim: true })
    email: string

    @Prop({ trim: true })
    phone: string

    @Prop({required: true, trim: true })
    jobTitle: string;

    @Prop({required: true, type: Types.ObjectId})
    createdBy: Types.ObjectId
}

export const SpeakerSchema = SchemaFactory.createForClass(Speaker);