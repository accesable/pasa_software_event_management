import { Module } from '@nestjs/common';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from 'apps/notification-service/src/config/mailer.config';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/notification-service/.env.example',
    }),
    // MailerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) =>
    //     await mailerConfig(configService),
    // }),
    MailerModule.forRootAsync({
      useFactory: mailerConfig,
    }),
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule { }
