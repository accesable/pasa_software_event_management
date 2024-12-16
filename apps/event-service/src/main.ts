import { NestFactory, Reflector } from '@nestjs/core';
import { EventServiceModule } from './event-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EVENT_PACKAGE_NAME } from '@app/common/types/event';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../event.proto'),
        package: EVENT_PACKAGE_NAME,
        url: '0.0.0.0:50052'
      },
    },
  );
  await app.listen();
}
bootstrap();
