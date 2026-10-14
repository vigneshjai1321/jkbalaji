import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';

const LEAD_TO = process.env.LEAD_EMAIL_TO ?? 'jamavisapvt@gmail.com';

@Injectable()
export class LeadNotifyService {
  private readonly log = new Logger(LeadNotifyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onNewLead(input: {
    site: string;
    name: string;
    phone: string;
    email?: string | null;
    message?: string | null;
  }) {
    await this.prisma.notification.create({
      data: {
        title: `New ${input.site} enquiry`,
        body: `${input.name} · ${input.phone}${input.email ? ` · ${input.email}` : ''}${input.message ? ` — ${input.message.slice(0, 120)}` : ''}`,
      },
    });

    this.log.log(
      `Lead saved (PostgreSQL + admin notification). Email target ${LEAD_TO}. ` +
        `Configure SMTP on API or nginx PHP: deployment/php/contact_*.php`,
    );
  }
}
