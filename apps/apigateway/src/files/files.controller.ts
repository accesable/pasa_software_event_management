import { BadRequestException, Controller, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'apps/apigateway/src/guards/jwt-auth.guard';

@Controller('users/upload')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // giới hạn 5MB
    },
    fileFilter: (req, file, callback) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new BadRequestException('Only [jpeg, png, jpg] types are allowed'), false);
      }
      callback(null, true);
    }
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }
}
