import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter | null = null;
  private readonly legalEmail: string;
  private readonly fromAddress: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    this.legalEmail = this.config.get<string>('LEGAL_EMAIL', 'legal@reviewhistory.pk');
    this.fromAddress = this.config.get<string>('MAIL_FROM', 'noreply@reviewhistory.pk');

    const host = this.config.get<string>('SMTP_HOST', '');
    this.enabled = !!host;

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(this.config.get<string>('SMTP_PORT', '587')),
        secure: this.config.get<string>('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: this.config.get<string>('SMTP_USER', ''),
          pass: this.config.get<string>('SMTP_PASS', ''),
        },
      });
      this.logger.log(`Mailer configured → ${host}`);
    } else {
      this.logger.warn('SMTP not configured — email sending disabled. Set SMTP_HOST to enable.');
    }
  }

  async sendLegalAlert(opts: {
    subject: string;
    reviewId: string;
    reportType: string;
    description?: string | null;
    reporterUserId: string;
    reviewBody?: string;
  }): Promise<void> {
    if (!this.enabled || !this.transporter) {
      this.logger.warn(`[MailerService] Email skipped (SMTP disabled): ${opts.subject}`);
      return;
    }

    const html = `
      <h2>⚠️ Legal Alert — ReviewHistory</h2>
      <p><strong>Type:</strong> ${opts.reportType}</p>
      <p><strong>Review ID:</strong> ${opts.reviewId}</p>
      <p><strong>Reported by User ID:</strong> ${opts.reporterUserId}</p>
      ${opts.description ? `<p><strong>Description:</strong> ${opts.description}</p>` : ''}
      ${opts.reviewBody ? `<p><strong>Review content:</strong><br/><em>${opts.reviewBody.slice(0, 500)}</em></p>` : ''}
      <hr/>
      <p>Please review this report in the admin panel and take appropriate action.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: this.legalEmail,
        subject: `[ReviewHistory Legal] ${opts.subject}`,
        html,
      });
      this.logger.log(`Legal alert sent to ${this.legalEmail}: ${opts.subject}`);
    } catch (err) {
      this.logger.error(`Failed to send legal alert email: ${(err as Error).message}`);
    }
  }

  async sendLegalComplaint(opts: {
    name: string;
    email: string;
    subject: string;
    message: string;
    reviewUrl?: string;
  }): Promise<void> {
    if (!this.enabled || !this.transporter) {
      this.logger.warn(`[MailerService] Legal complaint email skipped (SMTP disabled)`);
      return;
    }

    const html = `
      <h2>📩 Legal Complaint — ReviewHistory</h2>
      <p><strong>From:</strong> ${opts.name} &lt;${opts.email}&gt;</p>
      <p><strong>Subject:</strong> ${opts.subject}</p>
      <p><strong>Message:</strong><br/>${opts.message.replace(/\n/g, '<br/>')}</p>
      ${opts.reviewUrl ? `<p><strong>Related URL:</strong> ${opts.reviewUrl}</p>` : ''}
      <hr/>
      <p>Please respond within 72 hours per our privacy/legal policy.</p>
    `;

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: this.legalEmail,
        replyTo: opts.email,
        subject: `[ReviewHistory Legal Complaint] ${opts.subject}`,
        html,
      });
      this.logger.log(`Legal complaint sent from ${opts.email}`);
    } catch (err) {
      this.logger.error(`Failed to send legal complaint email: ${(err as Error).message}`);
    }
  }
}
