import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ClientGrpc, ClientProxy, RpcException } from '@nestjs/microservices';
import { handleRpcException } from '../../../libs/common/src/filters/handleException';
import { ForgotPasswordRequest, TokenData } from '../../../libs/common/src/types/notification';
import { EmailTemplates } from './mail/contants/template';
import { USERS_SERVICE_NAME, UsersServiceClient } from '../../../libs/common/src';
import { AUTH_SERVICE } from '../../apigateway/src/constants/service.constant';

@Injectable()
export class NotificationServiceService {
  private usersService: UsersServiceClient;

  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(AUTH_SERVICE) private clientAuth: ClientGrpc,
  ) { }

  onModuleInit() {
    this.usersService = this.clientAuth.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  async sendInvites(users: {email: string, id: string}[], event: any) {
    const eventId = event.id;
    const expireDateTime = this.calculateExpireDateTime(new Date(event.startDate), new Date(event.endDate));

    for (const user of users) {
      const token = this.jwtService.sign(
        { email: user.email, eventId, userId: user.id },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: expireDateTime,
        },
      );
      const url = `${this.configService.get<string>(
        'FRONTEND_URL',
      )}/events/${eventId}`;
      await this.sendMail(
        user.email,
        EmailTemplates.INVITE,
        'You are invited to ' + event.name,
        {
          email: user.email,
          eventTitle: event.name,
          acceptUrl: `${url}/accept?token=${token}`,
          declineUrl: `${url}/decline?token=${token}`,
        },
      );
    }
  }

  calculateExpireDateTime(eventStartDate: Date, eventEndDate: Date) {
    const now = new Date();
    const middleDate = new Date(
      eventStartDate.getTime() +
      (eventEndDate.getTime() - eventStartDate.getTime()) / 2,
    ); // Thời điểm giữa startDate và endDate
    let expiresInSeconds: number;

    // Nếu thời điểm hiện tại đã qua giữa sự kiện, token sẽ hết hạn trong 1 giờ
    if (now > middleDate) {
      expiresInSeconds = 60 * 60; // 1 giờ
    } else {
      expiresInSeconds = Math.floor(
        (middleDate.getTime() - now.getTime()) / 1000,
      ); // Số giây cho đến giữa sự kiện
    }

    return `${expiresInSeconds}s`;
  }

  handleUserCreated(data: any) {
    try {
      this.sendMail(data.email, EmailTemplates.WELCOME_EMAIL, 'Welcome to PASA', { name: data.name });
    } catch (error) {
      throw handleRpcException(error, 'Failed to send email');
    }
  }

  async sendMailForgotPassword(request: ForgotPasswordRequest) {
    try {
      const payload = { email: request.email, id: request.id, type: 'forgot-password', name: request.name };
      const token = this.createToken(payload);
      const url = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${token}`;
      const data = { name: request.name, resetLink: url };
      const res = await this.sendMail(request.email, EmailTemplates.FORGOT_PASSWORD, 'Reset Password', data);
      if (res.error) {
        throw new RpcException({
          message: "Failed to send email. Please try again later.",
          code: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      }

      const tokenData: TokenData = {
        id: request.id,
        email: request.email,
        type: 'forgot-password',
        name: request.name,
      };

      return { status: 'success', message: "If this email exists, a reset link has been sent to your email.", token, tokenData };
    } catch (error) {
      throw handleRpcException(error, 'Failed to send email');
    }
  }

  createToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("TOKEN_PASSWORD_EXPIRATION"),
    });
  }

  async sendMail(
    toEmail: string,
    template: EmailTemplates,
    subject: string,
    data: any,
  ): Promise<{ message: string; error?: string }> {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        from: '"PASA" <security@pasamail.com>',
        replyTo: '"noreply" <noreply@pasamail.com>',
        subject,
        template,
        context: data,
      });
      return { message: 'Email sent successfully' };
    } catch (err) {
      return { message: 'Failed to send email', error: err.message };
    }
  }
}
