import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CommissionKind, CommissionRateSource, Prisma } from '../../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RealEstateUnit } from '../auth/business-unit.decorator.js';
import { BusinessUnitGuard } from '../auth/business-unit.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { PrismaService } from '../../database/prisma.service.js';
import { ActivityLogService } from '../../common/activity-log.service.js';
import { commissionExpected, commissionStatus } from './measure.js';
import {
  COMMISSION_READ_ROLES,
  COMMISSION_SETTINGS_ROLES,
  COMMISSION_WRITE_ROLES,
} from './commission-roles.js';
import { CommissionPaymentService } from './commission-payment.service.js';
import { CommissionRateService } from './commission-rate.service.js';

type AuthedRequest = Request & { user?: { id: string; role: string } };

@Controller({ path: 'admin/commissions', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, BusinessUnitGuard)
@RealEstateUnit()
export class AdminCommissionController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rates: CommissionRateService,
    private readonly payments: CommissionPaymentService,
    private readonly audit: ActivityLogService,
  ) {}

  @Get('settings')
  @Roles(...COMMISSION_READ_ROLES)
  async getSettings() {
    const global = await this.rates.getGlobalDefault();
    const lastAudit = await this.prisma.commissionSettingsAudit.findFirst({
      where: { scope: 'GLOBAL' },
      orderBy: { createdAt: 'desc' },
      include: { changedBy: { select: { id: true, name: true, email: true } } },
    });
    return {
      defaultKind: global.kind,
      defaultRate: global.rate,
      effectiveKind: global.kind,
      effectiveRate: global.rate,
      rateSource: CommissionRateSource.GLOBAL,
      updatedAt: global.updatedAt,
      changedBy: lastAudit?.changedBy ?? null,
    };
  }

  @Patch('settings')
  @Roles(...COMMISSION_SETTINGS_ROLES)
  async patchSettings(@Req() req: AuthedRequest, @Body() body: { kind?: CommissionKind; rate?: number }) {
    if (body.kind !== CommissionKind.PERCENTAGE && body.kind !== CommissionKind.FIXED) {
      throw new BadRequestException('Choose percentage or fixed commission');
    }
    if (body.rate == null) throw new BadRequestException('Rate is required');
    const updated = await this.rates.updateGlobalDefault(
      { kind: body.kind, rate: Number(body.rate) },
      req.user?.id,
    );
    await this.audit.log({
      action: 'UPDATE',
      entity: 'commission_settings',
      summary: `Global commission rate set to ${updated.rate}% (${updated.kind})`,
    });
    return this.getSettings();
  }

  @Get('settings/audit')
  @Roles(...COMMISSION_READ_ROLES)
  settingsAudit(@Query('take') take?: string) {
    const n = Math.min(Math.max(Number(take) || 25, 1), 100);
    return this.prisma.commissionSettingsAudit.findMany({
      take: n,
      orderBy: { createdAt: 'desc' },
      include: { changedBy: { select: { id: true, name: true } } },
    });
  }

  @Get('dashboard')
  @Roles(...COMMISSION_READ_ROLES)
  async dashboard(@Query('from') from?: string, @Query('to') to?: string) {
    const where = this.dateRangeWhere(from, to);
    const rows = await this.prisma.commission.findMany({
      where: { ...where, voided: false },
      select: { expectedInr: true, paidInr: true, status: true, brokerId: true, projectId: true },
    });
    const expected = rows.reduce((s, r) => s + Number(r.expectedInr), 0);
    const paid = rows.reduce((s, r) => s + Number(r.paidInr), 0);
    const outstanding = Math.max(0, expected - paid);
    const statusCounts = { PENDING: 0, PARTIAL: 0, PAID: 0 };
    for (const r of rows) statusCounts[r.status] += 1;
    const activeBrokers = await this.prisma.broker.count({ where: { isActive: true } });

    const byBroker = await this.prisma.commission.groupBy({
      by: ['brokerId'],
      where: { voided: false, ...where },
      _sum: { expectedInr: true, paidInr: true },
    });
    const brokerIds = byBroker.map((b) => b.brokerId);
    const brokers = await this.prisma.broker.findMany({
      where: { id: { in: brokerIds } },
      select: { id: true, name: true },
    });
    const brokerMap = new Map(brokers.map((b) => [b.id, b.name]));

    const byProject = await this.prisma.commission.groupBy({
      by: ['projectId'],
      where: { voided: false, projectId: { not: null }, ...where },
      _sum: { expectedInr: true, paidInr: true },
    });
    const projectIds = byProject.map((p) => p.projectId!).filter(Boolean);
    const projects = await this.prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, name: true },
    });
    const projectMap = new Map(projects.map((p) => [p.id, p.name]));

    const recentPayments = await this.prisma.commissionPayment.findMany({
      where: { reversedAt: null, reversalOfId: null, ...(from || to ? { paidAt: this.dateRange(from, to) } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        commission: { select: { id: true, broker: { select: { name: true } } } },
        recordedBy: { select: { name: true } },
      },
    });

    return {
      totalExpected: Math.round(expected * 100) / 100,
      totalPaid: Math.round(paid * 100) / 100,
      totalOutstanding: Math.round(outstanding * 100) / 100,
      statusCounts,
      activeBrokers,
      byBroker: byBroker.map((b) => ({
        brokerId: b.brokerId,
        brokerName: brokerMap.get(b.brokerId) ?? '—',
        expected: Number(b._sum.expectedInr ?? 0),
        paid: Number(b._sum.paidInr ?? 0),
        outstanding: Math.max(0, Number(b._sum.expectedInr ?? 0) - Number(b._sum.paidInr ?? 0)),
      })),
      byProject: byProject.map((p) => ({
        projectId: p.projectId,
        projectName: p.projectId ? projectMap.get(p.projectId) ?? '—' : '—',
        expected: Number(p._sum.expectedInr ?? 0),
        paid: Number(p._sum.paidInr ?? 0),
        outstanding: Math.max(0, Number(p._sum.expectedInr ?? 0) - Number(p._sum.paidInr ?? 0)),
      })),
      recentPayments,
    };
  }

  @Get()
  @Roles(...COMMISSION_READ_ROLES)
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '25',
    @Query('sort') sort?: string,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('brokerId') brokerId?: string,
    @Query('projectId') projectId?: string,
    @Query('outstandingOnly') outstandingOnly?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const size = Math.min(Math.max(Number(pageSize) || 25, 1), 100);
    const skip = (p - 1) * size;
    const { field, direction } = this.rates.parseSort(sort);

    const where: Prisma.CommissionWhereInput = { voided: false };
    if (status) where.status = status as never;
    if (brokerId) where.brokerId = brokerId;
    if (projectId) where.projectId = projectId;
    if (from || to) where.createdAt = this.dateRange(from, to);
    if (outstandingOnly === '1' || outstandingOnly === 'true') {
      where.NOT = { status: 'PAID' };
    }
    const term = q?.trim();
    if (term) {
      where.OR = [
        { broker: { name: { contains: term, mode: 'insensitive' } } },
        { broker: { phone: { contains: term, mode: 'insensitive' } } },
        { project: { name: { contains: term, mode: 'insensitive' } } },
        { plot: { plotNumber: { contains: term, mode: 'insensitive' } } },
        { id: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.commission.count({ where }),
      this.prisma.commission.findMany({
        where,
        skip,
        take: size,
        orderBy: this.rates.commissionOrderBy(field, direction),
        include: {
          broker: { select: { id: true, name: true, phone: true } },
          project: { select: { id: true, name: true } },
          plot: { select: { id: true, plotNumber: true } },
          plotQuotation: { select: { id: true, status: true } },
        },
      }),
    ]);

    const data = items.map((row) => {
      const expected = Number(row.expectedInr);
      const paid = Number(row.paidInr);
      return {
        ...row,
        outstandingInr: Math.round(Math.max(0, expected - paid) * 100) / 100,
      };
    });

    return {
      data,
      page: p,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
    };
  }

  @Get('export')
  @Roles(...COMMISSION_WRITE_ROLES)
  async exportCsv(
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('brokerId') brokerId?: string,
    @Query('projectId') projectId?: string,
    @Query('outstandingOnly') outstandingOnly?: string,
  ) {
    const where: Prisma.CommissionWhereInput = { voided: false };
    if (status) where.status = status as never;
    if (brokerId) where.brokerId = brokerId;
    if (projectId) where.projectId = projectId;
    if (outstandingOnly === '1') where.NOT = { status: 'PAID' };

    const rows = await this.prisma.commission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 5000,
      include: {
        broker: { select: { name: true } },
        project: { select: { name: true } },
        plot: { select: { plotNumber: true } },
      },
    });

    const header = [
      'ID',
      'Broker',
      'Project',
      'Plot',
      'Rate',
      'Expected',
      'Paid',
      'Outstanding',
      'Status',
      'Created',
    ];
    const lines = rows.map((r) => {
      const expected = Number(r.expectedInr);
      const paid = Number(r.paidInr);
      const out = Math.max(0, expected - paid);
      return [
        r.id,
        r.broker.name,
        r.project?.name ?? '',
        r.plot?.plotNumber ?? '',
        `${r.rate}% (${r.kind})`,
        String(expected),
        String(paid),
        String(out),
        r.status,
        r.createdAt.toISOString(),
      ]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
        .join(',');
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="commissions.csv"');
    res.send([header.join(','), ...lines].join('\n'));
  }

  @Get(':id')
  @Roles(...COMMISSION_READ_ROLES)
  async detail(@Param('id') id: string) {
    const row = await this.prisma.commission.findUnique({
      where: { id },
      include: {
        broker: true,
        project: { select: { id: true, name: true, slug: true } },
        plot: { select: { id: true, plotNumber: true, areaSqft: true, pricePerSqftInr: true } },
        plotQuotation: { select: { id: true, status: true, createdAt: true } },
        property: { select: { id: true, title: true } },
        payments: {
          orderBy: { paidAt: 'desc' },
          include: { recordedBy: { select: { id: true, name: true } } },
        },
      },
    });
    if (!row) throw new NotFoundException('Commission not found');
    const expected = Number(row.expectedInr);
    const paid = Number(row.paidInr);
    return {
      ...row,
      outstandingInr: Math.round(Math.max(0, expected - paid) * 100) / 100,
      calculationLabel: 'Plot area (sq ft) × Price per sq ft',
    };
  }

  @Post(':id/payments')
  @Roles(...COMMISSION_WRITE_ROLES)
  async recordPayment(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body()
    body: { amountInr?: number; paidAt?: string; method?: string; reference?: string; notes?: string },
  ) {
    if (body.amountInr == null) throw new BadRequestException('Amount is required');
    const paidAt = body.paidAt ? new Date(body.paidAt) : new Date();
    if (Number.isNaN(paidAt.getTime())) throw new BadRequestException('Invalid payment date');
    const payment = await this.payments.recordPayment({
      commissionId: id,
      amountInr: Number(body.amountInr),
      paidAt,
      method: body.method,
      reference: body.reference,
      notes: body.notes,
      recordedById: req.user?.id,
    });
    await this.audit.log({
      action: 'CREATE',
      entity: 'commission_payment',
      entityId: payment.id,
      summary: `Commission payment ₹${body.amountInr} on ${id}`,
    });
    return this.detail(id);
  }

  @Post('payments/:paymentId/reverse')
  @Roles(...COMMISSION_SETTINGS_ROLES)
  async reversePayment(@Req() req: AuthedRequest, @Param('paymentId') paymentId: string) {
    await this.payments.reversePayment(paymentId, req.user?.id);
    await this.audit.log({
      action: 'UPDATE',
      entity: 'commission_payment',
      entityId: paymentId,
      summary: `Reversed commission payment ${paymentId}`,
    });
    return { ok: true };
  }

  private dateRange(from?: string, to?: string): Prisma.DateTimeFilter | undefined {
    if (!from && !to) return undefined;
    const gte = from ? new Date(from) : undefined;
    const lte = to ? new Date(to) : undefined;
    return { ...(gte && !Number.isNaN(gte.getTime()) ? { gte } : {}), ...(lte && !Number.isNaN(lte.getTime()) ? { lte } : {}) };
  }

  private dateRangeWhere(from?: string, to?: string): Prisma.CommissionWhereInput {
    const createdAt = this.dateRange(from, to);
    return createdAt ? { createdAt } : {};
  }
}
