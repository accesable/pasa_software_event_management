import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { CloudinaryProvider } from 'apps/apigateway/src/files/cloudinary/cloudinary.provider';

@Module({
  providers: [FilesService, CloudinaryProvider],
  exports: [FilesService],
})
export class FilesModule {}
