import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationServiceProtoControllerMethods, NotificationServiceProtoController, ForgotPasswordRequest, ForgotPasswordResponse } from '../../../libs/common/src/types/notification';
import { NotificationServiceService } from './notification-service.service';

@Controller()
@NotificationServiceProtoControllerMethods()
export class NotificationServiceController implements NotificationServiceProtoController {
  constructor(
    // private readonly notificationServiceService: NotificationServiceService,
    private readonly notificationService: NotificationServiceService
  ) { }

  @EventPattern('user_registered')
  async handleUserCreatedEvent(data: any) {
    this.notificationService.handleUserCreated(data);
  }

  @EventPattern('sendInvites')
  async sendInvites(emails: [string], event: any) {
    this.notificationService.sendInvites(emails, event);
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
