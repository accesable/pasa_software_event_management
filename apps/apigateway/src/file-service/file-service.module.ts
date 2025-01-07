import { Module } from '@nestjs/common';
import { FileServiceService } from './file-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { FILE_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { FILE_PACKAGE_NAME } from '@app/common/types/file';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: FILE_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: FILE_PACKAGE_NAME,
          protoPath: join(__dirname, '../file.proto'),
          url: '0.0.0.0:50056'
        },
      }
    ]),
  ],
  providers: [FileServiceService],
  exports: [FileServiceService],
})
export class FileServiceModule { }
