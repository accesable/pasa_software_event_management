import { Controller, Get, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationServiceProtoControllerMethods, NotificationServiceProtoController, ForgotPasswordRequest, ForgotPasswordResponse, SendInvitationMailRequest, SendInvitationMailResponse } from '../../../libs/common/src/types/notification';
import { NotificationServiceService } from './notification-service.service';
import { EmailTemplates } from './mail/contants/template';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Controller()
@NotificationServiceProtoControllerMethods()
export class NotificationServiceController implements NotificationServiceProtoController {
  private readonly logger = new Logger(NotificationServiceController.name);
  constructor(
    private readonly notificationService: NotificationServiceService
  ) { }
  sendInvitationMail(request: SendInvitationMailRequest): Promise<SendInvitationMailResponse> | Observable<SendInvitationMailResponse> | SendInvitationMailResponse {
    throw new Error('Method not implemented.');
  }

  @EventPattern('send_feedback_invitation')
  async handleFeedbackInvitation(
    @Payload() data: { emails: string[]; eventName: string; eventId: string },
  ) {
    this.logger.log(`Processing feedback invitation for emails: ${data.emails.join(', ')}`);
    await this.notificationService.sendFeedbackEmails(data.emails, data.eventName, data.eventId);
  }

  @EventPattern('event_update')
  async handleEventUpdate(@Payload() data: { event: any }) {
    console.log('Received event update notification:', data.event.registeredEmails);
    const url = `${process.env.FRONTEND_URL}/details/events/${data.event._id}`;
    const emails: string[] = data.event.registeredEmails || [];
    if (emails.length === 0) {
      console.log('No emails found for event update notification');
      return;
    }
    
    for (const email of emails) {
      await this.notificationService.sendMail(
        email,
        EmailTemplates.EVENT_UPDATE,
        `Event Updated: ${data.event.name}`,
        {
          eventName: data.event.name,
          updatedFields: data.event.updatedFields,
          eventUrl: url,
          currentYear: data.event.currentYear,
        }
      );
    }
  }

  @EventPattern('event_canceled')
  async handleEventCanceled(@Payload() data: { event: any }) {
    const users = data.event.participantsResponse.participants || [];
    console.log('cancel event and sent email to ', users);
    const url = `${process.env.FRONTEND_URL}/details/events/${data.event._id}`;
    for (const user of users) {
      await this.notificationService.sendMail(
        user.email,
        EmailTemplates.EVENT_CANCEL,
        `Event Cancelled: ${data.event.name}`,
        {
          eventName: data.event.name,
          name: user.name,
          url
        }
      );
    }
  }

  // @EventPattern('send_reminder')
  async handleSendReminder(
    @Payload() data: {
      emails: string[];
      eventName: string;
      eventStartTime: string;
      eventEndTime: string;
      location: string;
      eventDescription: string;
    }
  ) {
    this.logger.log(`Processing reminder for event: ${data.eventName}`);
    for (const email of data.emails) {
      await this.notificationService.sendMail(
        email,
        EmailTemplates.EVENT_REMINDER,
        `Reminder: ${data.eventName} is starting soon!`,
        {
          eventName: data.eventName,
          eventStartTime: data.eventStartTime,
          eventEndTime: data.eventEndTime,
          location: data.location,
          eventDescription: data.eventDescription,
        }
      );
      this.logger.log(`Sent reminder email to ${email} for event ${data.eventName}`);
    }
  }

  @EventPattern('user_registered')
  async handleUserCreatedEvent(data: any) {
    this.notificationService.handleUserCreated(data);
  }

  @EventPattern('send_invites')
  async sendInvites(@Payload() data: { users: { email: string, id: string }[]; event: any }) {
    console.log('send email to', data.users);
    this.notificationService.sendInvites(data.users, data.event);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const res = await this.notificationService.sendMailForgotPassword(request);

    if (res.status === 'error') {
      return { status: 'error', message: res.message };
    }

    return {
      status: 'success',
      message: res.message,
      token: res.token,
      tokenData: res.tokenData
    };
  }

}
