import { DecodeAccessResponse, UpdateAvatarRequest } from '@app/common';
import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from 'apps/apigateway/src/files/cloudinary/cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class FilesService {
    handleUploadFile(file: Express.Multer.File, oldAvatarId?: string): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'avatars', // Đặt vào thư mục avatars
                    resource_type: 'auto', // Tự động nhận diện loại tài nguyên (ảnh, video, v.v.)
                },
                async (error, result) => {
                    if (error) return reject(error);

                    // Nếu có public_id cũ, xóa ảnh cũ khỏi Cloudinary
                    if (oldAvatarId) {
                        try {
                            await cloudinary.uploader.destroy(oldAvatarId);
                        } catch (deleteError) {
                            console.log('Error deleting old avatar:', deleteError);
                        }
                    }

                    resolve(result);
                },
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async uploadFile(file: Express.Multer.File, user: DecodeAccessResponse) {
        return this.handleUploadFile(file, user.oldAvatarId);
    }
}
