import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { RpcExceptionInterceptor } from 'apps/apigateway/src/users/core/rpc-exception.interceptor';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const PORT = process.env.PORT || 8080;
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.enableVersioning(
    {
      type: VersioningType.URI,
      defaultVersion: "1",
    }
  );
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Loại bỏ các field không định nghĩa trong DTO
    forbidNonWhitelisted: true, // Ném lỗi nếu có field không định nghĩa trong DTO
    transform: true, // Tự động chuyển đổi kiểu dữ liệu
  }));
  // app.useGlobalInterceptors(new RpcExceptionInterceptor());
  app.enableCors(
    {
      "origin": "*",
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      "optionsSuccessStatus": 204,
      allowedHeaders: 'Content-Type, Accept, Authorization',
      credentials: true,
    }
  );
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}/api/v1`);
}
bootstrap();
