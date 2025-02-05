import { Module } from '@nestjs/common';
import { ReportServiceController } from './report-service.controller';
import { ReportServiceService } from './report-service.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

// Import proto constants (event, ticket)
import { EVENT_PACKAGE_NAME } from '../../../libs/common/src/types/event';
import { TICKET_PACKAGE_NAME } from '../../../libs/common/src/types/ticket';

// Tên token
import { EVENT_SERVICE, TICKET_SERVICE } from '../../apigateway/src/constants/service.constant';

@Module({
  imports: [
    // Kết nối sang event-service, ticket-service qua gRPC
    ClientsModule.register([
      {
        name: EVENT_SERVICE, // "EVENT_SERVICE"
        transport: Transport.GRPC,
        options: {
          package: EVENT_PACKAGE_NAME,                 // = "event"
          protoPath: join(__dirname, '../event.proto'), // copy event.proto
          url: '0.0.0.0:50052',
        },
      },
      {
        name: TICKET_SERVICE, // "TICKET_SERVICE"
        transport: Transport.GRPC,
        options: {
          package: TICKET_PACKAGE_NAME, 
          protoPath: join(__dirname, '../ticket.proto'),
          url: '0.0.0.0:50054',
        },
      },
    ]),
  ],
  controllers: [ReportServiceController],
  providers: [ReportServiceService],
})
export class ReportServiceModule {}
