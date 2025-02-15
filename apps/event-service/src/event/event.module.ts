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
import { FeedbackModule } from '../feedback/feedback.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AUTH_PACKAGE_NAME } from '../../../../libs/common/src';
import { AUTH_SERVICE } from '../../../apigateway/src/constants/service.constant';

@Module({
  imports: [
    EventCategoryModule,
    SpeakerModule,
    GuestModule,
    FeedbackModule,
    forwardRef(() => EventServiceModule),
    ScheduleModule.forRoot(),
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

    ClientsModule.register([
      {
        name: AUTH_SERVICE,
        transport: Transport.GRPC,
        options: {
          package: AUTH_PACKAGE_NAME,
          protoPath: join(__dirname, '../auth.proto'),
          url: '0.0.0.0:50051'
        },
      }
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule { }
