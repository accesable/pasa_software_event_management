import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'apps/apigateway/src/users/constants';
import { AUTH_PACKAGE_NAME } from '@app/common';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../auth.proto'),
        },
      }
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, 
    
  ],
})
export class UsersModule {}
