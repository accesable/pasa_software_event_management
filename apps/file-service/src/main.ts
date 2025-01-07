import { NestFactory } from '@nestjs/core';
import { FileServiceModule } from './file-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { FILE_PACKAGE_NAME } from '@app/common/types/file';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../file.proto'),
        package: FILE_PACKAGE_NAME,
        url: '0.0.0.0:50056',
      },
    },
  );
  await grpcApp.listen()

  const rabbitmqApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:1234@localhost:5672'],
        queue: 'files_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  )
  await rabbitmqApp.listen()

  console.log('Service file is listening on gRPC and RabbitMQ...');
}
bootstrap();
