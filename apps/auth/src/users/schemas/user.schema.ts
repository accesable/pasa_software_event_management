import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  phoneNumber: string;

  @Prop({default: "https://res.cloudinary.com/dbvyexitw/image/upload/v1733047490/default%20avatar.jpg"})
  avatar: string;

  @Prop()
  oldAvatarId: string;

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
