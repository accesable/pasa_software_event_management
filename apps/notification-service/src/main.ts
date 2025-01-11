import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NOTIFICATION_PACKAGE_NAME } from '../../../libs/common/src/types/notification';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../notification.proto'),
        package: NOTIFICATION_PACKAGE_NAME,
        url: '0.0.0.0:50053',
      },
    },
  );
  await grpcApp.listen()
  // RabbitMQ
  const rabbitmqApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:1234@localhost:5672'],
        queue: 'notifications_queue',
        queueOptions: {
          durable: true,
        },
      },
    },
  )
  await rabbitmqApp.listen()
  console.log('Service event is listening on gRPC and RabbitMQ...');
}
bootstrap();
