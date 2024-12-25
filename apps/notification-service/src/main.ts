import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { NOTIFICATION_PACKAGE_NAME } from '@app/common/types/notification';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../notification.proto'),
        package: NOTIFICATION_PACKAGE_NAME,
        url: '0.0.0.0:50053'
      },
    },
  );
  await app.listen();
}
bootstrap();
