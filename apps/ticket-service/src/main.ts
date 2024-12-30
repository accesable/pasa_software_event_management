import { NestFactory } from '@nestjs/core';
import { TicketServiceModule } from './ticket-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { TICKET_PACKAGE_NAME } from '@app/common/types/ticket';

async function bootstrap() {
  const app = await NestFactory.create(TicketServiceModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      protoPath: join(__dirname, '../ticket.proto'),
      package: TICKET_PACKAGE_NAME,
      url: '0.0.0.0:50054'
    },
  },
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:1234@localhost:5672'],
      queue: 'tickets_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();

  console.log('Service ticket is listening on gRPC and RabbitMQ...');
}
bootstrap();

