import { Module } from '@nestjs/common';
import { SpeakerService } from './speaker.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Speaker, SpeakerSchema } from 'apps/event-service/src/speaker/schemas/speaker.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Speaker.name, schema: SpeakerSchema },
    ]),
  ],
  providers: [SpeakerService],
  exports: [SpeakerService],
})
export class SpeakerModule {}
