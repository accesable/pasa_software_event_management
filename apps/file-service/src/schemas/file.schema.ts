import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileDocument = File &
  Document & {
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true, versionKey: false })
export class File {
  @Prop({ required: true })
  filename: string; // Tên file

  @Prop({ required: true })
  path: string; // URL của file trên Cloudinary

  @Prop({ required: true })
  mimetype: string; // Định dạng file

  @Prop({ required: true })
  size: number; // Kích thước file (bytes)

  @Prop()
  publicId: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  entityType: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  field: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
FileSchema.index({ entityId: 1, publicId: 1 });
FileSchema.index({ path: 1 });