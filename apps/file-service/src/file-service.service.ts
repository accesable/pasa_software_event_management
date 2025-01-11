import { HttpStatus, Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import * as streamifier from 'streamifier';
import { RpcException } from '@nestjs/microservices';
import { FileUpload, UploadOptions } from '../../../libs/common/src/types/file';
import { FileDocument } from './schemas/file.schema';

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
      // Save file information to the database
      const savedFiles = await this.fileModel.insertMany(
        uploadedFiles.map((file) => ({
          filename: file.original_filename,
          path: file.secure_url,
          mimetype: file.format,
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
      throw new RpcException({
        message: 'Failed to save file information to database',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async uploadToCloudinary(
    file: FileUpload,
    options: UploadOptions,
  ): Promise<any> {
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
  }

  async deleteFilesUrl(urls: string[], videoIntro: string) {
    try {
      if (videoIntro) {
        const f = await this.fileModel.findOne({ path: videoIntro });
        console.log(f);
        await cloudinary.uploader.destroy(f.publicId)
      }

      for (const url of urls) {
        this.fileModel.find({ path: url })
          .then(files => {
            if (!files || files.length === 0) {
              console.warn(`File not found with URL: ${url}`);
              return;
            }

            files.forEach(file => {
              const tasks = [];

              if (file.publicId) {
                tasks.push(
                  cloudinary.uploader.destroy(file.publicId)
                    .then(() => console.log(`Deleted file from Cloudinary: ${file.publicId}`))
                    .catch(err => console.error(`Failed to delete from Cloudinary: ${file.publicId}`, err))
                );
              }

              tasks.push(
                this.fileModel.findByIdAndDelete(file._id)
                  .then(() => console.log(`Deleted file record from database: ${file._id}`))
                  .catch(err => console.error(`Failed to delete file record: ${file._id}`, err))
              );

              Promise.all(tasks).catch(error =>
                console.error(`Error during deletion for URL ${url}:`, error)
              );
            });
          })
          .catch(error => console.error(`Failed to find files for URL ${url}:`, error));
      }
    } catch (error) {
      console.error('Failed to delete files:', error);
      throw new RpcException({
        message: error.message || 'Failed to delete files',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
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
        throw new RpcException({
          message: error.message || 'Failed to delete files',
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
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
      throw new RpcException({
        message: error.message || 'Failed to delete avatar',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }
}