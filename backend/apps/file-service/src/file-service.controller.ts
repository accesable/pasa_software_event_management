import { Controller, Get } from '@nestjs/common';
import { FileServiceService } from './file-service.service';
import { EventPattern } from '@nestjs/microservices';
import { FileServiceProtoControllerMethods, FileServiceProtoController, UploadFilesRequest, UploadFilesResponse, DeleteFilesRequest, DeleteFilesResponse } from '../../../libs/common/src/types/file';

@Controller()
@FileServiceProtoControllerMethods()
export class FileServiceController implements FileServiceProtoController {
  constructor(private readonly fileServiceService: FileServiceService) { }

  @EventPattern('delete_avatar')
  deleteAvatarEvent(data: any) {
    this.fileServiceService.deleteAvatarEvent(data);
  }

  @EventPattern('delete_files_event')
  deleteFilesEvent(data: any) {
    const { urls, videoURl } = data;
    this.fileServiceService.deleteFilesUrl(urls, videoURl);
  }

  async uploadFiles(request: UploadFilesRequest): Promise<UploadFilesResponse> {
    const files = request.files;
    const options = request.options;

    const result = await this.fileServiceService.handleFileUploads(files, options);

    const response: UploadFilesResponse = {
      files: result.map((fileInfo) => ({
        fileId: fileInfo._id.toString(),    // Lấy _id từ Mongo
        filename: this.normalizeFilename(fileInfo.filename),
        path: fileInfo.path,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        publicId: fileInfo.publicId,       // Bổ sung publicId vào response
      })),
    };

    return response;
  }

  normalizeFilename(filename: string) {
    return filename
      .normalize('NFD')                           // Phân tách các ký tự có dấu
      .replace(/[\u0300-\u036f]/g, '')              // Loại bỏ các dấu
      .replace(/\s+/g, '_')                         // Thay thế khoảng trắng bằng dấu gạch dưới
      .toLowerCase();                               // Chuyển thành chữ thường (tuỳ chọn)
  }

  async deleteFiles(request: DeleteFilesRequest): Promise<DeleteFilesResponse> {
    const { fileIds } = request;
    try {
      await this.fileServiceService.deleteFiles(fileIds);
      return {
        success: true,
        message: 'Files deleted successfully',
      };
    } catch (error) {
      console.error('Error during files deletion:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete files',
      };
    }
  }
}
