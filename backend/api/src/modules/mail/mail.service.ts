import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { UserRole } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { loadMailConfig, mailConfigSummary, type MailConfig } from './mail.config.js';
import {
  adminNotificationHtml,
  adminNotificationText,
  adminTestEmailHtml,
  adminTestEmailText,
} from './mail-templates.js';

export type SendResult = { ok: true; messageId: string; accepted: string[] } | { ok: false; error: string };

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private cachedConfig: MailConfig | null | undefined;

  constructor(private readonly prisma: PrismaService) {}

  getStatus() {
    const cfg = this.resolveConfig();
    return mailConfigSummary(cfg);
  }

  isConfigured(): boolean {
    return this.resolveConfig() !== null;
  }

  private resolveConfig(): MailConfig | null {
    if (this.cachedConfig === undefined) {
      this.cachedConfig = loadMailConfig();
    }
    return this.cachedConfig;
  }

  private getTransporter(): Transporter {
    const cfg = this.resolveConfig();
    if (!cfg) {
      throw new Error('SMTP is not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS or SMTP_PASSWORD, SMTP_FROM or SMTP_FROM_EMAIL)');
    }
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: cfg.host,
        port: cfg.port,
        secure: cfg.secure,
        auth: { user: cfg.user, pass: cfg.pass },
      });
    }
    return this.transporter;
  }

  async verifyConnection(): Promise<{ ok: boolean; error?: string }> {
    if (!this.isConfigured()) return { ok: false, error: 'SMTP not configured' };
    try {
      await this.getTransporter().verify();
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'SMTP verify failed';
      this.logger.warn(`SMTP verify failed: ${msg}`);
      return { ok: false, error: msg };
    }
  }

  async sendMail(opts: {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
  }): Promise<SendResult> {
    const cfg = this.resolveConfig();
    if (!cfg) return { ok: false, error: 'SMTP not configured' };

    try {
      const info = await this.getTransporter().sendMail({
        from: cfg.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      const accepted = Array.isArray(info.accepted) ? info.accepted.map(String) : [];
      this.logger.log(`Mail sent: subject="${opts.subject}" accepted=${accepted.length}`);
      return { ok: true, messageId: String(info.messageId ?? ''), accepted };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Send failed';
      this.logger.error(`Mail send failed: ${msg}`);
      return { ok: false, error: msg };
    }
  }

  async sendTestEmail(to: string): Promise<SendResult> {
    return this.sendMail({
      to,
      subject: 'JK Balaji — Admin email configuration test',
      html: adminTestEmailHtml(),
      text: adminTestEmailText(),
    });
  }

  /** Active SUPER_ADMIN and ADMIN users with valid email addresses. */
  async listAdminRecipientEmails(): Promise<string[]> {
    const rows = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
      },
      select: { email: true },
    });
    const emails = rows
      .map((r) => r.email.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    return [...new Set(emails)];
  }

  async notifyAdministrators(opts: {
    heading: string;
    message: string;
    detailLines?: string[];
  }): Promise<{ sent: SendResult[]; recipients: string[] }> {
    const recipients = await this.listAdminRecipientEmails();
    if (!recipients.length) {
      return { sent: [{ ok: false, error: 'No active admin recipients' }], recipients: [] };
    }
    const subject = `JK Balaji — ${opts.heading}`;
    const html = adminNotificationHtml(opts);
    const text = adminNotificationText(opts);
    const sent: SendResult[] = [];
    for (const to of recipients) {
      sent.push(await this.sendMail({ to, subject, html, text }));
    }
    return { sent, recipients };
  }
}
