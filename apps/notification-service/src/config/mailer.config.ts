import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

export const mailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.get<string>('MAIL_HOST', 'smtp.gmail.com'), 
    port: configService.get<number>('MAIL_PORT', 465),
    secure: configService.get<boolean>('MAIL_SECURE', true), 
    auth: {
      user: configService.get<string>('MAIL_USER'),
      pass: configService.get<string>('MAIL_PASS'), 
    },
  },
  defaults: {
    from: configService.get<string>('MAIL_FROM', '"noreply" <noreply@pasamail.com>'),
  },
  template: {
    dir: join(__dirname, '../mail/templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
