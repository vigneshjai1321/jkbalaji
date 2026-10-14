import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { MailService } from '../mail/mail.service.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Controller({ path: 'admin/mail', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AdminMailController {
  constructor(private readonly mail: MailService) {}

  @Get('status')
  status() {
    return this.mail.getStatus();
  }

  @Post('verify')
  async verify() {
    return this.mail.verifyConnection();
  }

  /** Send a test message to one authorized address (no secrets in body). */
  @Post('test')
  async test(@Body() body: { to?: string }) {
    const to = body.to?.trim().toLowerCase();
    if (!to || !EMAIL_RE.test(to)) {
      throw new BadRequestException('Valid "to" email is required');
    }
    const admins = await this.mail.listAdminRecipientEmails();
    const allowed = new Set([...admins, 'tmlcheyyar@gmail.com']);
    if (!allowed.has(to)) {
      throw new BadRequestException(
        'Recipient must be an active admin user email or an explicitly authorized test address',
      );
    }
    const result = await this.mail.sendTestEmail(to);
    if (!result.ok) throw new BadRequestException(result.error);
    return { ok: true, messageId: result.messageId, accepted: result.accepted };
  }

  @Get('recipients')
  async recipients() {
    const emails = await this.mail.listAdminRecipientEmails();
    return { count: emails.length, emails };
  }

  @Post('notify-admins')
  async notifyAdmins(
    @Body() body: { heading?: string; message?: string; detailLines?: string[] },
  ) {
    const heading = body.heading?.trim();
    const message = body.message?.trim();
    if (!heading || !message) {
      throw new BadRequestException('heading and message are required');
    }
    const { sent, recipients } = await this.mail.notifyAdministrators({
      heading,
      message,
      detailLines: body.detailLines?.filter(Boolean),
    });
    const ok = sent.every((s) => s.ok);
    if (!ok) {
      const err = sent.find((s) => !s.ok)?.error ?? 'One or more sends failed';
      throw new BadRequestException(err);
    }
    return { ok: true, recipients, messageIds: sent.filter((s) => s.ok).map((s) => s.messageId) };
  }
}
