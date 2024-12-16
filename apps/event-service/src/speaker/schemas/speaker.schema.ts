import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

    @Prop({ trim: true })
    linkFb: string;

    @Prop({ trim: true })
    avatar: string;

    @Prop({ trim: true })
    email: string

    @Prop({ trim: true })
    phone: string

    @Prop({ trim: true })
    jobTitle: string;
}

export const SpeakerSchema = SchemaFactory.createForClass(Speaker);