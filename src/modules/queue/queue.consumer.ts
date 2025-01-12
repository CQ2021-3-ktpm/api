import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '@/modules/auth/services/mail.service';
import { Job } from 'bullmq';
import { SendEmailsPayload } from '@/modules/queue/payloads/send-emails.payload';

export const enum QueueName {
  Default = 'defaultQueue',
}

export const enum JobName {
  SendEmail = 'sendEmail',
}

@Processor(QueueName.Default)
export class DefaultQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(DefaultQueueConsumer.name);
  constructor(private readonly mailService: MailService) {
    super();
  }

  process(job: Job, _: string | undefined): Promise<any> {
    this.logger.log(`Attempt to process job=${job.name}, payload=${job.data}`);

    switch (job.name) {
      case JobName.SendEmail:
        return this.handleSendEmail(job.data as SendEmailsPayload);
      default:
        return Promise.reject(`Unknown job name ${job.name}`);
    }
  }

  async handleSendEmail(payload: SendEmailsPayload) {
    // handle all case and name case
    const { recipients, body, subject } = payload;
    recipients.forEach((recipient) => {
      this.logger.log(`INFO, sending announcement for ${recipient}`);
      this.mailService.sendAnnouncement(recipient, subject, body);
    });
  }
}
