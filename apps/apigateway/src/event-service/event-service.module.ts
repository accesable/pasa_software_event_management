import { Module } from '@nestjs/common';
import { EventServiceService } from './event-service.service';
import { CategoryServiceController, EventServiceController, GuestServiceController, SpeakerServiceController } from './event-service.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'apps/apigateway/src/strategies/jwt.strategy';
import { RolesGuard } from 'apps/apigateway/src/guards/roles.guard';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EVENT_SERVICE } from 'apps/apigateway/src/constants/service.constant';
import { join } from 'path';
import { EVENT_PACKAGE_NAME } from '@app/common/types/event';
import { UsersModule } from 'apps/apigateway/src/users/users.module';
import { RedisCacheModule } from 'apps/apigateway/src/redis/redis.module';

@Module({
  imports: [
    UsersModule,
    RedisCacheModule,
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
  providers: [EventServiceService, JwtStrategy, RolesGuard],
  exports: [EventServiceService],
})
export class EventServiceModule { }
