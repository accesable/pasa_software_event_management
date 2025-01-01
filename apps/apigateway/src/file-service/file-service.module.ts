import { Module } from '@nestjs/common';
import { FileServiceService } from './file-service.service';
import { FileServiceController } from './file-service.controller';
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
          protoPath: join(__dirname, '../ticket.proto'),
          url: '0.0.0.0:50056'
        },
      }
    ]),
  ],
  controllers: [FileServiceController],
  providers: [FileServiceService],
})
export class FileServiceModule { }
