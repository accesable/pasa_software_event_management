import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATION_SERVICE } from '../constants/service.constant';
import { join } from 'path';
import { NOTIFICATION_PACKAGE_NAME } from '../../../../libs/common/src/types/notification';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: NOTIFICATION_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: NOTIFICATION_PACKAGE_NAME,
          protoPath: join(__dirname, '../notification.proto'),
          url: '0.0.0.0:50053'
        },
      }
    ])
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule { }
