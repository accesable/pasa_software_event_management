import { NestFactory } from '@nestjs/core';
import { ReportServiceModule } from './report-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { REPORT_PACKAGE_NAME } from '../../../libs/common/src/types/report';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    ReportServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../report.proto'),
        package: REPORT_PACKAGE_NAME,
        url: '0.0.0.0:50055',
      },
    },
  );
  await grpcApp.listen();
  console.log('Report-service gRPC is listening on port 50055...');
}
bootstrap();
