import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc, RpcException } from '@nestjs/microservices';
import { FILE_SERVICE } from '../constants/service.constant';
import { lastValueFrom } from 'rxjs';
import { FileServiceProtoClient, FILE_SERVICE_PROTO_SERVICE_NAME, UploadOptions, FileUpload } from '../../../../libs/common/src/types/file';

export interface FileUploadResult {
    fileId: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    publicId: string;
}

@Injectable()
export class FileServiceService implements OnModuleInit {
    private fileService: FileServiceProtoClient;

    constructor(
        @Inject(FILE_SERVICE) private client: ClientGrpc,
    ) { }

    onModuleInit() {
        this.fileService = this.client.getService<FileServiceProtoClient>(FILE_SERVICE_PROTO_SERVICE_NAME);
    }

    async uploadFiles(
        files: Express.Multer.File[],
        options: UploadOptions,
    ): Promise<FileUploadResult[]> {
        try {
            const fileUploads: FileUpload[] = files.map((file) => {
                const parts = file.originalname.split('.');
                const extension = parts.pop();
                const baseName = parts.join('.');
                const newFileName = `${baseName}${Date.now()}.${extension}`;
                return {
                    data: file.buffer,
                    fileName: newFileName,
                    mimeType: file.mimetype,
                    size: file.size,
                };
            });

            const res = await lastValueFrom(
                this.fileService.uploadFiles({
                    files: fileUploads,
                    options,
                }),
            );

            return res.files;
        } catch (error) {
            console.error('Failed to upload files:', error);
            throw new RpcException(error);
        }
    }
}
