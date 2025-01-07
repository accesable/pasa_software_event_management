import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvitedUserDocument = InvitedUser & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class InvitedUser {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending',
    })
    status: string;
}

export const InvitedUserSchema = SchemaFactory.createForClass(InvitedUser);