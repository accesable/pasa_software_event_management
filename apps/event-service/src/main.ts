import { NestFactory, Reflector } from '@nestjs/core';
import { EventServiceModule } from './event-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { EVENT_PACKAGE_NAME } from '@app/common/types/event';

async function bootstrap() {
  const grpcApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        protoPath: join(__dirname, '../event.proto'),
        package: EVENT_PACKAGE_NAME,
        url: '0.0.0.0:50052',
      },
    },
  );
  await grpcApp.listen()
  // RabbitMQ
  const rabbitmqApp = await NestFactory.createMicroservice<MicroserviceOptions>(
    EventServiceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:1234@localhost:5672'],
        queue: 'events_queue',
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
