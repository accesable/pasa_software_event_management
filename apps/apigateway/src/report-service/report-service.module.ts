import { Module } from '@nestjs/common';
import { ReportServiceService } from './report-service.service';
import { ReportServiceController } from './report-service.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { REPORT_PACKAGE_NAME } from '../../../../libs/common/src/types/report';
import { REPORT_SERVICE } from '../constants/service.constant';
import { RedisCacheModule } from '../redis/redis.module';

@Module({
  imports: [
    RedisCacheModule,
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
