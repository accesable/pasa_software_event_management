import { forwardRef, Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventCategoryModule } from '../event-category/event-category.module';
import { EventCategory, EventCategorySchema } from '../event-category/schemas/event-category.schema';
import { EventServiceModule } from '../event-service.module';
import { GuestModule } from '../guest/guest.module';
import { SpeakerModule } from '../speaker/speaker.module';
import { EventSchema } from './schemas/event.schema';
import { InvitedUser, InvitedUserSchema } from './schemas/invite.schema';
import { Question, QuestionSchema } from './schemas/question.schema';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from '../config/env.validation';

@Module({
  imports: [
    EventCategoryModule,
    SpeakerModule,
    GuestModule,
    forwardRef(() => EventServiceModule),

    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: EventCategory.name, schema: EventCategorySchema },
      { name: Question.name, schema: QuestionSchema },
      { name: InvitedUser.name, schema: InvitedUserSchema },
      { name: Feedback.name, schema: FeedbackSchema },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule { }
