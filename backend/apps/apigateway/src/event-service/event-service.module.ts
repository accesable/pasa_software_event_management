import { forwardRef, Module } from '@nestjs/common';
import { EventServiceService } from './event-service.service';
import { CategoryServiceController, EventServiceController, GuestServiceController, SpeakerServiceController } from './event-service.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENT_SERVICE } from '../constants/service.constant';
import { join } from 'path';
import { UsersModule } from '../users/users.module';
import { RedisCacheModule } from '../redis/redis.module';
import { FileServiceModule } from '../file-service/file-service.module';
import { AppModule } from '../app.module';
import { TicketServiceModule } from '../ticket-service/ticket-service.module';
import { EVENT_PACKAGE_NAME } from '../../../../libs/common/src/types/event';

@Module({
  imports: [
    UsersModule,
    RedisCacheModule,
    FileServiceModule,
    forwardRef(() => TicketServiceModule),
    forwardRef(() => AppModule),
    ClientsModule.register([
      {
        name: EVENT_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: EVENT_PACKAGE_NAME,
          protoPath: join(__dirname, '../event.proto'),
          url: '0.0.0.0:50052'
        },
      }
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },
      }),
    }),
  ],
  controllers: [EventServiceController, CategoryServiceController, SpeakerServiceController, GuestServiceController],
  providers: [EventServiceService, JwtStrategy],
  exports: [EventServiceService],
})
export class EventServiceModule { }
