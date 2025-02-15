import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvitedUserDocument = InvitedUser & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class InvitedUser {
    @Prop({ type: Types.ObjectId, ref: 'Event', required: true })
    eventId: Types.ObjectId;

    // Thêm trường userId
    @Prop({ type: Types.ObjectId, required: true })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true })
    email: string;

    @Prop({ type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' })
    status: string;
}

export const InvitedUserSchema = SchemaFactory.createForClass(InvitedUser);
InvitedUserSchema.index({ eventId: 1, email: 1 }, { unique: true });