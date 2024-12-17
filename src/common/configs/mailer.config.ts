import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export const MailerConfig = MailerModule.forRoot({
  transport: {
    host: process.env.SMTP_HOST,
    port: 465,
    secure: 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  defaults: {
    from: `"No Reply" <${process.env.DEFAULT_FROM_EMAIL}>`,
  },
  template: {
    dir: join(__dirname, '../templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
