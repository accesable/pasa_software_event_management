import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from 'apps/event-service/src/event/schemas/event.schema';
import { EventCategoryModule } from 'apps/event-service/src/event-category/event-category.module';

@Module({
  imports: [
    EventCategoryModule,
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
