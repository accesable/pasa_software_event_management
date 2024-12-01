import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning(
    {
      type: VersioningType.URI,
      defaultVersion: "1",
    }
  );
  await app.listen(8080);
  console.log(`Application is running on: ${await app.getUrl()}/api/v1`);
}
bootstrap();
