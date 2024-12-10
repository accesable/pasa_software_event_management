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

    async uploadFile(file: Express.Multer.File) {
        // const userId = req.user.id;  // Giả sử bạn lấy userId từ request
        // const user = await this.userService.findOneById(userId);

        // // Gọi service để upload ảnh mới và xóa ảnh cũ nếu có
        // try {
        //     const result = await this.uploadFile(file, user.avatarPublicId);

        //     // Cập nhật avatar mới vào cơ sở dữ liệu
        //     await this.userService.updateAvatar(userId, result.public_id);

        //     return result;
        // } catch (error) {
        //     throw new BadRequestException('Error uploading file: ' + error.message);
        // }
        return;
    }
}
