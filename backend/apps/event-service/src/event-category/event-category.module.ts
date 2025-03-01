import { Module } from '@nestjs/common';
import { EventCategoryService } from './event-category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EventCategory, EventCategorySchema } from './schemas/event-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EventCategory.name, schema: EventCategorySchema }]),
  ],
  providers: [EventCategoryService],
  exports: [EventCategoryService],
})
export class EventCategoryModule { }
