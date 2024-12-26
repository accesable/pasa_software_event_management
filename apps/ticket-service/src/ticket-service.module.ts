import { Module } from '@nestjs/common';
import { TicketServiceController } from './ticket-service.controller';
import { TicketServiceService } from './ticket-service.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/ticket-service/.env.example',
    }),
  ],
  controllers: [TicketServiceController],
  providers: [TicketServiceService],
})
export class TicketServiceModule { }
