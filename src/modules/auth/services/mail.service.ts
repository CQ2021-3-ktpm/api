import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { handleError } from 'src/common/utils';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendSignInEmail(to: string, link: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Sign In to KTPM App',
        template: './sign-in',
        context: {
          email: to,
          link,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }

  async sendAnnouncement(to: string, subject: string, content: string) {
    try {
      await this.mailerService.sendMail({
        to,
        from: 'Người đẹp trai nhất hành tinh',
        subject: subject,
        template: './announcement',
        context: {
          email: to,
          content,
        },
      });
    } catch (error) {
      handleError(error);
    }
  }
}
