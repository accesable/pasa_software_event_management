import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';
import { FileUpload, UploadOptions } from '../../../libs/common/src/types/file';
import { FileDocument } from './schemas/file.schema';
import { handleRpcException } from '../../../libs/common/src/filters/handleException';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class FileServiceService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<FileDocument>,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async handleFileUploads(
    files: FileUpload[],
    options: UploadOptions,
  ): Promise<FileDocument[]> {
    if(!files) {
      throw new RpcException({
        message: 'No file to upload',
        code: HttpStatus.BAD_REQUEST,
      });
    }
    const uploadPromises = files.map((file) =>
      this.uploadToCloudinary(file, options).catch((error) => {
        console.error(
          `Failed to upload file ${file.fileName}:`,
          error.message,
        );
        return null;
      }),
    );

    try {
      const uploadedFiles = (await Promise.all(uploadPromises)).filter(
        (file) => file !== null,
      );

      const savedFiles = await this.fileModel.insertMany(
        uploadedFiles.map((file) => (
          {
            filename: file.original_filename,
            path: file.secure_url,
            mimetype: file.format || file.resource_type,
            size: file.bytes,
            entityId: options.entityId,
            entityType: options.entityType,
            type: options.type,
            field: options.field,
            publicId: file.public_id,
          })),
      );

      return savedFiles;
    } catch (error) {
      console.error('Failed to save file information to database:', error);
      throw handleRpcException(error, 'Failed to save file information to database');
    }
  }

  async uploadToCloudinary(
    file: FileUpload,
    options: UploadOptions,
  ): Promise<any> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: `${options.entityType}/${options.field}`,
            public_id: file.fileName,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              console.error('Failed to upload file to Cloudinary:', error);
              return reject(
                new BadRequestException('Failed to upload file to Cloudinary'),
              );
            }
            resolve(result);
          },
        );
        if (!file.data) {
          const errorMessage = `File ${file.fileName} is undefined or has no data`;
          console.error(errorMessage);
          return reject(new BadRequestException(errorMessage));
        }
        streamifier.createReadStream(file.data).pipe(uploadStream);
      });
    } catch (error) {
      console.error('Failed to upload file to Cloudinary:', error);
      throw handleRpcException(error, 'Failed to upload file to Cloudinary');
    }
  }

  async deleteFilesUrl(urls: string[], videoIntro: string) {
    try {
      if (videoIntro) {
        const f = await this.fileModel.findOne({ path: videoIntro });
        if (f) {
          try {
            await cloudinary.uploader.destroy(f.publicId, { resource_type: 'video' });
            console.log(`Deleted video from Cloudinary: ${f.publicId}`);
            await this.fileModel.findByIdAndDelete(f._id);
            console.log(`Deleted video record from database: ${f._id}`);
          } catch (err) {
            console.error(`Failed to delete video: ${f.publicId}`, err);
          }
        }
      }

      for (const url of urls) {
        const files = await this.fileModel.find({ path: url });
        for (const file of files) {
          if (file.publicId) {
            try {
              await cloudinary.uploader.destroy(file.publicId);
              console.log(`Deleted file from Cloudinary: ${file.publicId}`);
            } catch (err) {
              console.error(`Failed to delete from Cloudinary: ${file.publicId}`, err);
            }
          }
          try {
            await this.fileModel.findByIdAndDelete(file._id);
            console.log(`Deleted file record from database: ${file._id}`);
          } catch (err) {
            console.error(`Failed to delete file record: ${file._id}`, err);
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete files:', error);
      throw handleRpcException(error, 'Failed to delete files');
    }
  }

  async deleteFiles(fileIds: string[]): Promise<void> {
    for (const fileId of fileIds) {
      try {
        const file = await this.fileModel.findById(fileId);
        if (!file) {
          console.warn(`File not found with ID: ${fileId}`);
          continue;
        }

        if (file.publicId) {
          await cloudinary.uploader.destroy(file.publicId);
          console.log(`Deleted file from Cloudinary: ${file.publicId}`);
        }

        await this.fileModel.findByIdAndDelete(fileId);
        console.log(`Deleted file record from database: ${fileId}`);
      } catch (error) {
        console.error(`Failed to delete file with ID ${fileId}:`, error);
        throw handleRpcException(error, 'Failed to delete files');
      }
    }
  }

  async deleteAvatarEvent(data: any) {
    try {
      const f = await this.fileModel.findOne({ entityId: data.entityId, publicId: data.publicId });

      cloudinary.uploader.destroy(f.publicId);
      this.fileModel.findByIdAndDelete(f._id);
      return;
    }
    catch (error) {
      console.error('Failed to delete avatar:', error);
      throw handleRpcException(error, 'Failed to delete avatar');
    }
  }
}