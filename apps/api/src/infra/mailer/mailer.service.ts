import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const smtpUrl = process.env.SMTP_URL || 'smtp://localhost:1025';
    try {
      this.transporter = nodemailer.createTransport(smtpUrl);
    } catch (err) {
      this.logger.warn(`Could not initialize mail transporter: ${err}`);
    }
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Transporter not ready, skipping mail to ${options.to}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: '"Dars LMS" <noreply@dars.test>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.log(`Email dispatched to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error}`);
    }
  }
}
