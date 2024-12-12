import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { GeneralUsersController, UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'apps/apigateway/src/users/constants';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { GoogleStrategy } from 'apps/apigateway/src/strategies/google.stategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'apps/apigateway/src/strategies/jwt.strategy';
import { FilesService } from 'apps/apigateway/src/files/files.service';

@Module({
  imports: [
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
        secret: configService.get<string>('JWT_SECRET'),  // Lấy biến từ .env
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') },  // Lấy thời gian hết hạn từ .env
      }),
    }),
  ],
  controllers: [UsersController, GeneralUsersController],
  providers: [UsersService, GoogleStrategy, JwtStrategy, FilesService ],
})
export class UsersModule {}
