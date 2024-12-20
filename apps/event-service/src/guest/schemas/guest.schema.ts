import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GuestDocument = Guest & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Guest {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ trim: true })
    jobTitle: string;

    @Prop({ trim: true })
    organization: string;

    @Prop({ trim: true })
    linkSocial: string;

    @Prop({ trim: true })
    avatar: string;
}

export const GuestSchema = SchemaFactory.createForClass(Guest);
