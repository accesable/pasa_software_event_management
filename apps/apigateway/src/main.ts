import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
  await app.listen(8080);
  console.log(`Application is running on: ${await app.getUrl()}/api/v1`);
}
bootstrap();
