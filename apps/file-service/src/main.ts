import { NestFactory } from '@nestjs/core';
import { FileServiceModule } from './file-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../file.proto'),
        package: TICKET_PACKAGE_NAME,
        url: '0.0.0.0:50056',
      },
    },
  );
  await grpcApp.listen()
}
bootstrap();
