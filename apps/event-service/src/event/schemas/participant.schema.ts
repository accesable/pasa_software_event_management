import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ParticipantDocument = Participant & Document & {
    createdAt: Date;
    updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class Participant {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', index: true })
    userId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', index: true })
    eventId: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Ticket', index: true })
    ticketId: string;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);