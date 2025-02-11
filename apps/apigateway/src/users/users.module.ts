import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { GeneralUsersController, UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../constants/service.constant';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { NotificationModule } from '../notification/notification.module';
import { RedisCacheModule } from '../redis/redis.module';
import { FileServiceModule } from '../file-service/file-service.module';
import { AUTH_PACKAGE_NAME } from '../../../../libs/common/src';
import { GoogleStrategy } from '../strategies/google.stategy';
import { EventServiceModule } from '../event-service/event-service.module';

@Module({
  imports: [
    NotificationModule,
    RedisCacheModule,
    FileServiceModule,
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../auth.proto'),
          url: '0.0.0.0:50051'
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
  controllers: [UsersController, GeneralUsersController],
  providers: [UsersService, GoogleStrategy, JwtStrategy],
  exports: [UsersService],
})
export class UsersModule { }
