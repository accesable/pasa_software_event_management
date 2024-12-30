import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from 'apps/event-service/src/event/schemas/event.schema';
import { EventCategoryModule } from 'apps/event-service/src/event-category/event-category.module';
import { EventCategory, EventCategorySchema } from 'apps/event-service/src/event-category/schemas/event-category.schema';
import { SpeakerModule } from 'apps/event-service/src/speaker/speaker.module';
import { GuestModule } from 'apps/event-service/src/guest/guest.module';
import { EventServiceModule } from 'apps/event-service/src/event-service.module';

@Module({
  imports: [
    EventCategoryModule,
    SpeakerModule,
    GuestModule,
    forwardRef(() => EventServiceModule),

    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: EventCategory.name, schema: EventCategorySchema },
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule { }
