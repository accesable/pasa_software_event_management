import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from 'apps/auth/src/core/transform.interceptor';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from 'apps/apigateway/src/config/env.validation';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/apigateway/.env',
      validate: validateEnv,
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
