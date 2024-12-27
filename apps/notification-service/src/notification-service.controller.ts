import { ForgotPasswordRequest, ForgotPasswordResponse, NotificationServiceProtoController, NotificationServiceProtoControllerMethods } from '@app/common/types/notification';
import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationServiceService } from 'apps/notification-service/src/notification-service.service';

@Controller()
@NotificationServiceProtoControllerMethods()
export class NotificationServiceController implements NotificationServiceProtoController {
  constructor(
    private readonly notificationServiceService: NotificationServiceService,
    private readonly notificationService: NotificationServiceService
  ) { }

  @EventPattern('user_registered')
  async handleUserCreatedEvent(data: any) {
    await this.notificationService.handleUserCreated(data);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const res = await this.notificationServiceService.sendMailForgotPassword(request);

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
