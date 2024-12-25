import { handleRpcException } from '@app/common/filters/handleException';
import { ForgotPasswordRequest, TokenData } from '@app/common/types/notification';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { EmailTemplates } from 'apps/notification-service/src/mail/contants/template';

@Injectable()
export class NotificationServiceService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) { }

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
      const ttlSeconds = +this.configService.get<string>("TOKEN_PASSWORD_EXPIRATION"); // 15 minutes
      const expiredAt = Date.now() + ttlSeconds * 1000;
      const createdAt = Date.now();
  
      const tokenData: TokenData = {
        id: request.id,
        email: request.email,
        type: 'forgot-password',
        name: request.name,
        used: false,
        expiredAt,
        createdAt,
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
