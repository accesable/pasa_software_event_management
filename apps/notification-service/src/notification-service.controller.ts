import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
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

  @EventPattern('send_invites')
  async sendInvites(@Payload() data: { users: {email: string, id: string}[]; event: any }) {
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
