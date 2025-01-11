import { Module } from '@nestjs/common';
import { FileServiceController } from './file-service.controller';
import { FileServiceService } from './file-service.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from './schemas/file.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: 'apps/file-service/.env.example',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FileServiceController],
  providers: [FileServiceService],
})
export class FileServiceModule {}
