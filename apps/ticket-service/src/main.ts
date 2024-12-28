import { NestFactory } from '@nestjs/core';
import { TicketServiceModule } from './ticket-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TICKET_PACKAGE_NAME } from '@app/common/types/ticket';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    TicketServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../notification.proto'),
        package: TICKET_PACKAGE_NAME,
        url: '0.0.0.0:50054'
      },
    },
  );
  await app.listen();
}
bootstrap();

