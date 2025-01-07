import { Controller, Get } from '@nestjs/common';
import { FileServiceService } from './file-service.service';
import { DeleteFilesRequest, DeleteFilesResponse, FileServiceProtoController, FileServiceProtoControllerMethods, UploadFilesRequest, UploadFilesResponse } from '@app/common/types/file';
import { Observable } from 'rxjs';
import { EventPattern } from '@nestjs/microservices';

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
        filename: fileInfo.filename,
        path: fileInfo.path,
        mimetype: fileInfo.mimetype,
        size: fileInfo.size,
        publicId: fileInfo.publicId,       // Bổ sung publicId vào response
      })),
    };
    return response;
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
