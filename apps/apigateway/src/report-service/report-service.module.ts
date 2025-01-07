import { Module } from '@nestjs/common';
import { ReportServiceService } from './report-service.service';
import { ReportServiceController } from './report-service.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { REPORT_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { REPORT_PACKAGE_NAME } from '@app/common/types/report';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: REPORT_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: REPORT_PACKAGE_NAME,
          protoPath: join(__dirname, '../report.proto'),
          url: '0.0.0.0:50055'
        },
      }
    ]),
  ],
  controllers: [ReportServiceController],
  providers: [ReportServiceService],
})
export class ReportServiceModule { }
