import { Controller } from '@nestjs/common';
import { FileServiceService } from './file-service.service';

@Controller('file-service')
export class FileServiceController {
  constructor(private readonly fileServiceService: FileServiceService) {}
}
