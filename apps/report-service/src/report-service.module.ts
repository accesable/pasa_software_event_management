import { Module } from '@nestjs/common';
import { ReportServiceController } from './report-service.controller';
import { ReportServiceService } from './report-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EVENT_PACKAGE_NAME } from '../../../libs/common/src/types/event';
import { TICKET_PACKAGE_NAME } from '../../../libs/common/src/types/ticket';
import { EVENT_SERVICE, TICKET_SERVICE } from '../../apigateway/src/constants/service.constant';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: EVENT_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: EVENT_PACKAGE_NAME,
          protoPath: join(
            __dirname,
            '../event.proto',
          ),
          url: '0.0.0.0:50052',
        },
      },
      {
        name: TICKET_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: TICKET_PACKAGE_NAME,
          protoPath: join(
            __dirname,
            '../ticket.proto',
          ),
          url: '0.0.0.0:50054',
        },
      },
    ]),
  ],
  controllers: [ReportServiceController],
  providers: [ReportServiceService],
  exports: [ReportServiceService],
})
export class ReportServiceModule {}