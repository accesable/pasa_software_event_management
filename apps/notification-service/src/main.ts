import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NOTIFICATION_PACKAGE_NAME } from '@app/common/types/notification';

async function bootstrap() {
  // Tạo microservice gRPC
  const app = await NestFactory.create(NotificationServiceModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      protoPath: join(__dirname, '../notification.proto'),
      package: NOTIFICATION_PACKAGE_NAME,
      url: '0.0.0.0:50053',
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:1234@localhost:5672'],
      queue: 'notifications_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  console.log('Service notification is listening on gRPC and RabbitMQ...');
}
bootstrap();
