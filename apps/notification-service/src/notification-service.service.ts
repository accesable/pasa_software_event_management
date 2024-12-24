import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EmailTemplates } from 'apps/notification-service/src/mail/contants/template';

@Injectable()
export class NotificationServiceService {
  constructor(private readonly mailerService: MailerService) { }

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
