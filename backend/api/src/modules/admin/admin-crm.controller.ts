import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ActivityAction, SiteKey } from '../../generated/prisma/client.js';
import { ActivityLogService } from '../../common/activity-log.service.js';
import { clientIp } from '../../common/request-meta.js';
import { PrismaService } from '../../database/prisma.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller({ path: 'admin/crm', version: '1' })
@UseGuards(JwtAuthGuard)
export class AdminCrmController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activity: ActivityLogService,
  ) {}

  @Post('leads')
  async createLead(
    @Body()
    body: {
      site?: SiteKey;
      name: string;
      phone: string;
      email?: string;
      message?: string;
      source?: string;
      propertyId?: string;
    },
    @Req() req: Request & { user: { sub: string } },
  ) {
    const lead = await this.prisma.lead.create({
      data: {
        site: body.site ?? SiteKey.REAL_ESTATE,
        name: body.name,
        phone: body.phone,
        email: body.email,
        message: body.message,
        source: body.source ?? 'MANUAL',
        propertyId: body.propertyId,
      },
    });
    await this.activity.log({
      userId: req.user.sub,
      action: ActivityAction.CREATE,
      entity: 'lead',
      entityId: lead.id,
      summary: `Lead created: ${lead.name}`,
      ipAddress: clientIp(req),
    });
    return lead;
  }

  @Post('leads/:id/notes')
  async addNote(
    @Param('id') id: string,
    @Body() body: { body: string },
    @Req() req: Request & { user: { sub: string } },
  ) {
    const note = await this.prisma.leadNote.create({
      data: { leadId: id, body: body.body, createdById: req.user.sub },
    });
    await this.activity.log({
      userId: req.user.sub,
      action: ActivityAction.CREATE,
      entity: 'lead_note',
      entityId: note.id,
      summary: `Note added on lead ${id}`,
      ipAddress: clientIp(req),
    });
    return note;
  }

  @Get('leads/:id/notes')
  notes(@Param('id') id: string) {
    return this.prisma.leadNote.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { name: true } } },
    });
  }

  @Post('leads/:id/followups')
  async addFollowup(
    @Param('id') id: string,
    @Body() body: { dueAt: string; notes?: string; assignedToId?: string },
    @Req() req: Request & { user: { sub: string } },
  ) {
    const fu = await this.prisma.leadFollowup.create({
      data: {
        leadId: id,
        dueAt: new Date(body.dueAt),
        notes: body.notes,
        assignedToId: body.assignedToId ?? req.user.sub,
      },
    });
    await this.activity.log({
      userId: req.user.sub,
      action: ActivityAction.CREATE,
      entity: 'lead_followup',
      entityId: fu.id,
      summary: `Follow-up scheduled for lead ${id}`,
      ipAddress: clientIp(req),
    });
    return fu;
  }

  @Get('followups/pending')
  pendingFollowups() {
    return this.prisma.leadFollowup.findMany({
      where: { completedAt: null },
      orderBy: { dueAt: 'asc' },
      include: { lead: { select: { name: true, phone: true, status: true } }, assignedTo: { select: { name: true } } },
    });
  }
}
