import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { RealEstateUnit } from '../auth/business-unit.decorator.js';
import { BusinessUnitGuard } from '../auth/business-unit.guard.js';
import { CommissionRateSource } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { ActivityLogService } from '../../common/activity-log.service.js';
import { computeQuotationTotals, type PlotChargeInput } from './plot-calculations.js';
import { commissionExpected, commissionStatus } from './measure.js';
import { CommissionRateService } from './commission-rate.service.js';
import { COMMISSION_WRITE_ROLES, PLOT_SALES_ROLES } from './commission-roles.js';
import { JK_NAGAR_PHASE_1_SLUG } from './jk-nagar-phase-1-plots.js';
import { jkNagarPhase1ImportRows, planPlotImport, type PlotImportResult } from './plot-import.js';
import { syncPlotBasePrice } from './plot-validation.js';
import { groupPlotImportReviews } from './plot-import-review.js';

type ChargeBody = PlotChargeInput;

@Controller({ path: 'admin/erp', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, BusinessUnitGuard)
@RealEstateUnit()
export class AdminPlotSalesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: ActivityLogService,
    private readonly commissionRates: CommissionRateService,
  ) {}

  @Get('plots/import/reviews')
  async importReviews(@Query('projectId') projectId?: string) {
    const rows = await this.prisma.plotImportReview.findMany({
      where: { projectId: projectId || undefined, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    const groups = groupPlotImportReviews(rows);
    return { groups, conflictCount: groups.length, rawCount: rows.length };
  }

  @Post('plots/import/jk-nagar-phase-1')
  async importJkNagarPhase1() {
    const project = await this.prisma.project.findUnique({ where: { slug: JK_NAGAR_PHASE_1_SLUG } });
    if (!project) throw new NotFoundException('JK Nagar Phase 1 project not found — sync projects first.');
    return this.runJkNagarPhase1Import(project.id, jkNagarPhase1ImportRows());
  }

  @Post('plots/import')
  async importPlots(@Body() body: { projectId?: string; rows?: Array<{ plotNumber: string; areaSqft: number; sourceNote?: string }> }) {
    if (!body.projectId) throw new BadRequestException('projectId is required');
    if (!Array.isArray(body.rows) || body.rows.length === 0) throw new BadRequestException('rows array is required');
    return this.runGenericImport(body.projectId, body.rows);
  }

  /** JK Nagar Phase 1: auto-skip duplicate list entries; never overwrite existing plots. */
  private async runJkNagarPhase1Import(
    projectId: string,
    rows: Array<{ plotNumber: string; areaSqft: number; sourceNote?: string }>,
  ) {
    const plan = await this.buildImportPlan(projectId, rows);
    const persisted = await this.persistImportCreates(projectId, plan.imported);

    await this.audit.log({
      action: 'CREATE',
      entity: 'plot_import',
      entityId: projectId,
      summary: `JK Nagar Phase 1 import: ${persisted.createdCount} created, ${persisted.skippedCount} skipped, ${plan.duplicates.length} duplicate rows skipped, ${plan.conflicts.length} conflicts`,
    });

    return {
      imported: persisted.items,
      duplicates: plan.duplicates,
      conflicts: plan.conflicts,
      summary: {
        created: persisted.createdCount,
        skipped: persisted.skippedCount,
        duplicates: plan.duplicates.length,
        conflicts: plan.conflicts.length,
      },
    };
  }

  private async runGenericImport(projectId: string, rows: Array<{ plotNumber: string; areaSqft: number; sourceNote?: string }>) {
    const plan = await this.buildImportPlan(projectId, rows);
    const persisted = await this.persistImportCreates(projectId, plan.imported);

    await this.prisma.$transaction(async (tx) => {
      for (const c of plan.conflicts) {
        const dup = await tx.plotImportReview.findFirst({
          where: {
            projectId,
            suppliedPlotNumber: c.plotNumber,
            resolvedAt: null,
            areaSqft: c.importAreaSqft,
          },
        });
        if (dup) continue;
        await tx.plotImportReview.create({
          data: {
            projectId,
            suppliedPlotNumber: c.plotNumber,
            areaSqft: c.importAreaSqft,
            reason: c.reason,
          },
        });
      }
    });

    await this.audit.log({
      action: 'CREATE',
      entity: 'plot_import',
      entityId: projectId,
      summary: `Plot import: ${persisted.createdCount} created, ${plan.conflicts.length} conflicts`,
    });

    return {
      imported: persisted.items,
      duplicates: plan.duplicates,
      conflicts: plan.conflicts,
      summary: {
        created: persisted.createdCount,
        skipped: persisted.skippedCount,
        duplicates: plan.duplicates.length,
        conflicts: plan.conflicts.length,
      },
    };
  }

  private async buildImportPlan(projectId: string, rows: Array<{ plotNumber: string; areaSqft: number }>) {
    const existing = await this.prisma.plot.findMany({
      where: { projectId, archived: false },
      select: { id: true, plotNumber: true, areaSqft: true },
    });
    return planPlotImport(
      rows,
      existing.map((p) => ({ ...p, areaSqft: p.areaSqft != null ? Number(p.areaSqft) : null })),
    );
  }

  private async persistImportCreates(projectId: string, items: PlotImportResult['imported']) {
    const out: PlotImportResult['imported'] = [];
    let createdCount = 0;
    let skippedCount = 0;

    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (item.action === 'skipped') {
          out.push(item);
          skippedCount += 1;
          continue;
        }
        const row = await tx.plot.create({
          data: {
            projectId,
            plotNumber: item.plotNumber,
            areaSqft: item.areaSqft,
            status: 'AVAILABLE',
          },
        });
        await tx.plotEvent.create({ data: { plotId: row.id, action: 'IMPORTED', detail: `Area ${item.areaSqft} sq ft` } });
        out.push({ ...item, plotId: row.id, action: 'created' });
        createdCount += 1;
      }
    });

    return { items: out, createdCount, skippedCount };
  }

  @Patch('plots/import/reviews/:id/resolve')
  async resolveImportReview(@Param('id') id: string, @Body() body: { plotNumber?: string; dismiss?: boolean }) {
    const review = await this.prisma.plotImportReview.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review item not found');
    if (body.dismiss) {
      await this.prisma.plotImportReview.update({ where: { id }, data: { resolvedAt: new Date(), reason: `${review.reason} (dismissed)` } });
      return { ok: true };
    }
    const plotNumber = body.plotNumber?.trim();
    if (!plotNumber) throw new BadRequestException('plotNumber required to resolve, or set dismiss: true');
    const projectId = review.projectId;
    const existing = await this.prisma.plot.findFirst({ where: { projectId, plotNumber, archived: false } });
    if (existing) throw new BadRequestException('That plot number already exists — choose a unique label.');
    const row = await this.prisma.plot.create({
      data: {
        projectId,
        plotNumber,
        areaSqft: review.areaSqft,
        status: 'AVAILABLE',
        description: review.sourceNote,
      },
    });
    await this.prisma.plotImportReview.update({
      where: { id },
      data: { resolvedAt: new Date(), resolvedPlotId: row.id },
    });
    await this.prisma.plotEvent.create({
      data: { plotId: row.id, action: 'IMPORT_RESOLVED', detail: `From review ${review.suppliedPlotNumber}` },
    });
    return row;
  }

  @Get('plots/:id/events')
  plotEvents(@Param('id') id: string) {
    return this.prisma.plotEvent.findMany({ where: { plotId: id }, orderBy: { createdAt: 'desc' }, take: 50 });
  }

  @Post('plot-quotations/preview')
  @Roles(...PLOT_SALES_ROLES)
  previewQuotation(
    @Body()
    body: {
      plotId?: string;
      projectId?: string;
      areaSqft?: number;
      pricePerSqftInr?: number;
      charges?: ChargeBody[];
      brokerId?: string;
      broker?: {
        kind?: 'PERCENTAGE' | 'FIXED';
        rate?: number;
        paidBy?: 'SELLER' | 'BUYER';
        includeInTotal?: boolean;
      };
    },
  ) {
    return this.buildQuotationTotals(body);
  }

  private async buildQuotationTotals(body: {
    plotId?: string;
    projectId?: string;
    areaSqft?: number;
    pricePerSqftInr?: number;
    charges?: ChargeBody[];
    brokerId?: string;
    broker?: {
      kind?: 'PERCENTAGE' | 'FIXED';
      rate?: number;
      paidBy?: 'SELLER' | 'BUYER';
      includeInTotal?: boolean;
    };
  }) {
    let area = body.areaSqft != null ? Number(body.areaSqft) : NaN;
    if (body.plotId) {
      const plot = await this.prisma.plot.findUnique({ where: { id: body.plotId }, select: { areaSqft: true } });
      if (!plot) throw new NotFoundException('Plot not found');
      area = plot.areaSqft != null ? Number(plot.areaSqft) : NaN;
    }
    const rate = Number(body.pricePerSqftInr);
    if (!Number.isFinite(area) || area <= 0) throw new BadRequestException('Valid plot area is required');
    if (!Number.isFinite(rate) || rate < 0) throw new BadRequestException('Price per sq ft is required');

    const baseOnly = computeQuotationTotals({ areaSqft: area, pricePerSqftInr: rate, charges: [] });
    let projectId = body.projectId;
    if (!projectId && body.plotId) {
      const plotRow = await this.prisma.plot.findUnique({ where: { id: body.plotId }, select: { projectId: true } });
      projectId = plotRow?.projectId ?? undefined;
    }
    let brokerKind = body.broker?.kind;
    let brokerRate = body.broker?.rate != null ? Number(body.broker.rate) : undefined;
    if (body.brokerId && (!brokerKind || brokerRate == null)) {
      const resolved = await this.commissionRates.resolveEffectiveRate({
        brokerId: body.brokerId,
        projectId: projectId ?? null,
      });
      brokerKind = resolved.kind;
      brokerRate = resolved.rate;
    }
    const totals = computeQuotationTotals({
      areaSqft: area,
      pricePerSqftInr: rate,
      charges: body.charges ?? [],
      broker: brokerKind
        ? {
            kind: brokerKind,
            rate: Number(brokerRate ?? 0),
            basePlotPriceInr: baseOnly.basePlotPriceInr,
            paidBy: body.broker?.paidBy === 'BUYER' ? 'BUYER' : 'SELLER',
            includeInTotal: Boolean(body.broker?.includeInTotal),
          }
        : null,
    });
    return { ...totals, resolvedBrokerRate: brokerKind ? { kind: brokerKind, rate: brokerRate } : null };
  }

  @Get('plot-quotations')
  quotations(@Query('projectId') projectId?: string, @Query('plotId') plotId?: string) {
    return this.prisma.plotQuotation.findMany({
      where: { projectId: projectId || undefined, plotId: plotId || undefined },
      orderBy: { updatedAt: 'desc' },
      include: {
        plot: { select: { plotNumber: true, areaSqft: true, status: true } },
        customer: { select: { id: true, name: true, phone: true } },
        broker: { select: { id: true, name: true } },
        project: { select: { name: true } },
      },
    });
  }

  @Get('plot-quotations/:id')
  quotation(@Param('id') id: string) {
    return this.prisma.plotQuotation.findUniqueOrThrow({
      where: { id },
      include: {
        charges: { orderBy: { sortOrder: 'asc' } },
        plot: { include: { project: { select: { name: true, slug: true } } } },
        customer: true,
        broker: true,
        project: true,
        commission: true,
      },
    });
  }

  @Post('plot-quotations')
  @Roles(...PLOT_SALES_ROLES)
  async createQuotation(
    @Body()
    body: {
      projectId?: string;
      plotId?: string;
      customerId?: string;
      pricePerSqftInr?: number;
      charges?: ChargeBody[];
      status?: 'DRAFT' | 'QUOTED';
      brokerId?: string;
      broker?: { kind?: 'PERCENTAGE' | 'FIXED'; rate?: number; paidBy?: 'SELLER' | 'BUYER'; includeInTotal?: boolean };
      validUntil?: string;
      notes?: string;
      terms?: string;
    },
  ) {
    if (!body.plotId || !body.customerId) throw new BadRequestException('plotId and customerId are required');
    const plot = await this.prisma.plot.findUnique({
      where: { id: body.plotId },
      include: { project: true },
    });
    if (!plot) throw new NotFoundException('Plot not found');
    const projectId = body.projectId ?? plot.projectId;
    if (!projectId) throw new BadRequestException('Plot must belong to a project');

    const totals = await this.buildQuotationTotals({
      plotId: body.plotId,
      projectId,
      pricePerSqftInr: body.pricePerSqftInr,
      charges: body.charges,
      brokerId: body.brokerId,
      broker: body.brokerId ? body.broker : undefined,
    });
    const resolved = totals.resolvedBrokerRate;
    const commissionKind = body.broker?.kind ?? resolved?.kind;
    const commissionRate = body.broker?.rate != null ? Number(body.broker.rate) : resolved?.rate;

    const status = body.status === 'QUOTED' ? 'QUOTED' : 'DRAFT';

    return this.prisma.$transaction(async (tx) => {
      const q = await tx.plotQuotation.create({
        data: {
          projectId,
          plotId: body.plotId!,
          customerId: body.customerId!,
          status,
          pricePerSqftInr: Number(body.pricePerSqftInr),
          basePlotPriceInr: totals.basePlotPriceInr,
          additionalTotalInr: totals.additionalTotalInr,
          estimatedTotalInr: totals.estimatedTotalInr,
          includeCommissionInTotal: Boolean(body.broker?.includeInTotal),
          brokerId: body.brokerId || null,
          commissionKind: commissionKind ?? null,
          commissionRate: commissionRate != null ? Number(commissionRate) : null,
          commissionExpectedInr: totals.commissionExpectedInr,
          commissionPaidBy: body.broker?.paidBy === 'BUYER' ? 'BUYER' : 'SELLER',
          validUntil: body.validUntil ? new Date(body.validUntil) : null,
          notes: body.notes?.trim() || null,
          terms: body.terms?.trim() || null,
          charges: {
            create: totals.chargeLines.map((c, i) => ({
              label: c.label,
              kind: c.kind,
              fixedAmountInr: c.kind === 'FIXED' ? c.fixedAmountInr ?? c.amountInr : null,
              percentRate: c.kind === 'PERCENT' ? c.percentRate ?? null : null,
              percentBase: c.percentBase ?? 'BASE_PLOT',
              amountInr: c.amountInr,
              sortOrder: i,
            })),
          },
        },
        include: { charges: true },
      });

      await tx.plot.update({
        where: { id: body.plotId! },
        data: {
          pricePerSqftInr: Number(body.pricePerSqftInr),
          priceInr: syncPlotBasePrice(Number(plot.areaSqft), Number(body.pricePerSqftInr), null),
        },
      });

      if (body.brokerId && commissionKind && totals.commissionExpectedInr != null) {
        const existing = await tx.commission.findFirst({
          where: { plotId: body.plotId!, voided: false, plotQuotation: { status: { not: 'VOID' } } },
        });
        if (existing) {
          throw new BadRequestException(
            'This plot already has an active commission. Void the previous quotation or mark its commission for review.',
          );
        }
        const rateMeta = await this.commissionRates.resolveEffectiveRate({
          brokerId: body.brokerId,
          projectId,
        });
        await tx.commission.create({
          data: {
            brokerId: body.brokerId,
            plotId: body.plotId!,
            projectId,
            plotQuotationId: q.id,
            kind: commissionKind,
            rate: Number(commissionRate ?? 0),
            rateSource: rateMeta.source,
            calculationBasis: 'BASE_PLOT',
            saleValueInr: totals.basePlotPriceInr,
            expectedInr: totals.commissionExpectedInr,
            paidInr: 0,
            status: 'PENDING',
          },
        });
      }

      await tx.plotEvent.create({
        data: { plotId: body.plotId!, action: 'QUOTATION', detail: `Quotation ${q.id} (${status})` },
      });

      await this.audit.log({ action: 'CREATE', entity: 'plot_quotation', entityId: q.id, summary: `Plot quotation for ${plot.plotNumber}` });
      return q;
    });
  }

  @Post('plot-quotations/:id/void')
  @Roles(...PLOT_SALES_ROLES)
  async voidQuotation(@Param('id') id: string) {
    const q = await this.prisma.plotQuotation.findUnique({ where: { id }, include: { commission: true } });
    if (!q) throw new NotFoundException('Quotation not found');
    return this.prisma.$transaction(async (tx) => {
      await tx.plotQuotation.update({ where: { id }, data: { status: 'VOID' } });
      if (q.commission) {
        const paid = Number(q.commission.paidInr);
        await tx.commission.update({
          where: { id: q.commission.id },
          data: {
            voided: paid <= 0,
            needsReview: paid > 0,
            notes: q.commission.notes
              ? `${q.commission.notes}\nQuotation voided — review required.`
              : 'Quotation voided — review required.',
          },
        });
      }
      await this.audit.log({ action: 'UPDATE', entity: 'plot_quotation', entityId: id, summary: 'Quotation voided' });
      return { ok: true };
    });
  }

  @Post('plot-quotations/:id/reserve')
  @Roles(...PLOT_SALES_ROLES)
  async reserveFromQuotation(@Param('id') id: string) {
    const q = await this.prisma.plotQuotation.findUnique({ where: { id }, include: { plot: true } });
    if (!q) throw new NotFoundException('Quotation not found');
    if (q.status === 'VOID') throw new BadRequestException('Quotation is void');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.plot.updateMany({
        where: { id: q.plotId, status: 'AVAILABLE' },
        data: { status: 'RESERVED', customerId: q.customerId, brokerId: q.brokerId },
      });
      if (updated.count === 0) {
        const current = await tx.plot.findUnique({ where: { id: q.plotId } });
        throw new ConflictException(`Plot is not available (current status: ${current?.status ?? 'unknown'}).`);
      }
      const row = await tx.plotQuotation.update({
        where: { id },
        data: { status: 'RESERVATION' },
      });
      await tx.plotEvent.create({ data: { plotId: q.plotId, action: 'RESERVED', detail: `Via quotation ${id}` } });
      await this.audit.log({ action: 'UPDATE', entity: 'plot', entityId: q.plotId, summary: `Plot ${q.plot.plotNumber} reserved` });
      return row;
    });
  }

  @Post('plot-quotations/:id/mark-sold')
  @Roles(...PLOT_SALES_ROLES)
  async markSoldFromQuotation(@Param('id') id: string) {
    const q = await this.prisma.plotQuotation.findUnique({ where: { id }, include: { plot: true } });
    if (!q) throw new NotFoundException('Quotation not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.plot.updateMany({
        where: { id: q.plotId, status: { in: ['AVAILABLE', 'RESERVED'] }, customerId: q.customerId },
        data: { status: 'SOLD', customerId: q.customerId, brokerId: q.brokerId },
      });
      if (updated.count === 0) throw new ConflictException('Plot cannot be marked sold — check status and customer.');
      await tx.plotEvent.create({ data: { plotId: q.plotId, action: 'SOLD', detail: `Via quotation ${id}` } });
      await this.audit.log({ action: 'UPDATE', entity: 'plot', entityId: q.plotId, summary: `Plot ${q.plot.plotNumber} sold` });
      return tx.plotQuotation.findUnique({ where: { id } });
    });
  }

  @Patch('commissions/:id/plot-payment')
  @Roles(...COMMISSION_WRITE_ROLES)
  async updatePlotCommissionPayment(@Param('id') id: string, @Body() body: { paidInr?: number }) {
    const current = await this.prisma.commission.findUniqueOrThrow({ where: { id } });
    const paid = body.paidInr === undefined ? Number(current.paidInr) : Number(body.paidInr);
    if (!Number.isFinite(paid) || paid < 0) throw new BadRequestException('Paid amount must be zero or more');
    const expected = Number(current.expectedInr);
    return this.prisma.commission.update({
      where: { id },
      data: {
        paidInr: paid,
        status: commissionStatus(expected, paid),
        paidOn: paid > 0 ? current.paidOn ?? new Date() : null,
      },
    });
  }
}
