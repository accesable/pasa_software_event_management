import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phoneNumber: string;

  @Prop({default: "https://res.cloudinary.com/dbvyexitw/image/upload/v1733047490/default%20avatar.jpg"})
  avatar: string;

  @Prop()
  password: string;

  @Prop()
  refreshToken?: string;

  @Prop({ default: 'student', enum: ['student', 'teacher', 'organizer' ,'admin'] })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
