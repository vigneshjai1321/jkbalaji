import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { JewelleryUnit, RealEstateUnit } from '../auth/business-unit.decorator.js';
import { BusinessUnitGuard } from '../auth/business-unit.guard.js';
import { COMMISSION_READ_ROLES, COMMISSION_WRITE_ROLES } from './commission-roles.js';
import { CommissionRateService } from './commission-rate.service.js';
import { CommissionRateSource } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';
import { ActivityLogService } from '../../common/activity-log.service.js';
import { commissionExpected, commissionStatus } from './measure.js';
import { JournalValidationError, parseJournalWrite } from './journal-validation.js';
import { PlotValidationError, isPhase3ComingSoon, parsePlotWrite, syncPlotBasePrice } from './plot-validation.js';
import {
  canPlaceManualHold,
  canReleaseManualHold,
  latestManualHoldFromEvents,
  serializeHoldDetail,
} from './plot-hold.js';

@Controller({ path: 'admin/erp', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard, BusinessUnitGuard)
@RealEstateUnit()
export class AdminErpController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: ActivityLogService,
    private readonly commissionRates: CommissionRateService,
  ) {}

  private plotInclude = {
    project: { select: { id: true, name: true, slug: true, phase: true } },
    customer: { select: { id: true, name: true, phone: true } },
    broker: { select: { id: true, name: true, phone: true } },
  };

  private plotWhereFromQuery(projectId?: string, status?: string, archived?: string, q?: string): Prisma.PlotWhereInput {
    const where: Prisma.PlotWhereInput = {};
    if (projectId) where.projectId = projectId;
    if (status) where.status = status as never;
    if (archived === 'only') where.archived = true;
    else if (archived === 'include') {
      /* all */
    } else where.archived = false;
    const term = q?.trim();
    if (term) {
      where.OR = [
        { plotNumber: { contains: term, mode: 'insensitive' } },
        { surveyNumber: { contains: term, mode: 'insensitive' } },
        { project: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }
    return where;
  }

  private plotDataFromWrite(input: ReturnType<typeof parsePlotWrite>, existing?: { areaSqft: unknown; pricePerSqftInr: unknown }) {
    const area =
      input.areaSqft !== undefined ? input.areaSqft : existing?.areaSqft != null ? Number(existing.areaSqft) : null;
    const rate =
      input.pricePerSqftInr !== undefined
        ? input.pricePerSqftInr
        : existing?.pricePerSqftInr != null
          ? Number(existing.pricePerSqftInr)
          : null;
    const explicitPrice = input.priceInr !== undefined ? input.priceInr : null;
    const syncedPrice =
      input.pricePerSqftInr !== undefined || input.areaSqft !== undefined || input.priceInr !== undefined
        ? syncPlotBasePrice(area, rate, explicitPrice)
        : undefined;

    return {
      ...(input.plotNumber !== undefined ? { plotNumber: input.plotNumber } : {}),
      ...(input.surveyNumber !== undefined ? { surveyNumber: input.surveyNumber } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
      ...(input.areaSqft !== undefined ? { areaSqft: input.areaSqft } : {}),
      ...(input.lengthFt !== undefined ? { lengthFt: input.lengthFt } : {}),
      ...(input.widthFt !== undefined ? { widthFt: input.widthFt } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.facing !== undefined ? { facing: input.facing } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.pricePerSqftInr !== undefined ? { pricePerSqftInr: input.pricePerSqftInr } : {}),
      ...(syncedPrice !== undefined ? { priceInr: syncedPrice } : input.priceInr !== undefined ? { priceInr: input.priceInr } : {}),
      ...(input.customerId !== undefined ? { customerId: input.customerId } : {}),
      ...(input.brokerId !== undefined ? { brokerId: input.brokerId } : {}),
      ...(input.archived !== undefined ? { archived: input.archived } : {}),
    };
  }

  private async logPlotEvent(plotId: string, action: string, detail?: string) {
    await this.prisma.plotEvent.create({ data: { plotId, action, detail: detail ?? null } });
  }

  private async assertPlotProjectAllowsWrite(projectId: string | null | undefined, creating: boolean) {
    if (!projectId) return;
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, slug: true, phase: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (creating && isPhase3ComingSoon(project)) {
      throw new BadRequestException('JK Nagar Phase 3 is coming soon — plot inventory is not open yet.');
    }
  }

  private handlePlotWriteError(err: unknown): never {
    if (err instanceof PlotValidationError) throw new BadRequestException(err.message);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new BadRequestException('This plot number is already used in that project.');
    }
    throw err;
  }

  @Get('plots/summary')
  async plotsSummary(@Query('projectId') projectId?: string) {
    const where = this.plotWhereFromQuery(projectId, undefined, undefined, undefined);
    where.archived = false;
    const rows = await this.prisma.plot.findMany({
      where,
      select: { status: true, areaSqft: true, priceInr: true, pricePerSqftInr: true },
    });
    const area = (list: typeof rows) =>
      Math.round(list.reduce((sum, row) => sum + (row.areaSqft ? Number(row.areaSqft) : 0), 0) * 100) / 100;
    const by = (status: string) => rows.filter((r) => r.status === status);
    const pricedAvailable = by('AVAILABLE').filter((r) => r.pricePerSqftInr != null || r.priceInr != null);
    const availableValueInr = Math.round(
      pricedAvailable.reduce((sum, row) => sum + (row.priceInr ? Number(row.priceInr) : 0), 0) * 100,
    ) / 100;
    const unpricedAvailable = by('AVAILABLE').length - pricedAvailable.length;
    return {
      total: rows.length,
      available: by('AVAILABLE').length,
      reserved: by('RESERVED').length,
      sold: by('SOLD').length,
      blocked: by('BLOCKED').length,
      totalAreaSqft: area(rows),
      availableAreaSqft: area(by('AVAILABLE')),
      soldAreaSqft: area(by('SOLD')),
      availableValueInr,
      unpricedAvailable,
    };
  }

  @Get('plots')
  plots(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('archived') archived?: string,
    @Query('q') q?: string,
  ) {
    return this.prisma.plot.findMany({
      where: this.plotWhereFromQuery(projectId, status, archived, q),
      orderBy: [{ project: { name: 'asc' } }, { plotNumber: 'asc' }],
      include: this.plotInclude,
    });
  }

  @Get('plots/:id')
  async plot(@Param('id') id: string) {
    const row = await this.prisma.plot.findUniqueOrThrow({
      where: { id },
      include: {
        ...this.plotInclude,
        events: { orderBy: { createdAt: 'desc' }, take: 30 },
      },
    });
    const activeReservation = await this.prisma.plotQuotation.count({
      where: { plotId: id, status: 'RESERVATION' },
    });
    const holdState = latestManualHoldFromEvents(row.events);
    return {
      ...row,
      holdInfo: {
        activeQuotationReservation: activeReservation > 0,
        manualHold: holdState.meta,
        manualHoldReleased: holdState.released,
      },
    };
  }

  @Post('plots/:id/hold')
  async holdPlot(
    @Param('id') id: string,
    @Body() body: { customerId?: string; reason?: string; notes?: string; holdUntil?: string },
  ) {
    const customerId = body.customerId?.trim();
    if (!customerId) throw new BadRequestException('Customer is required to place a hold.');
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId }, select: { id: true, name: true } });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.$transaction(async (tx) => {
      const plot = await tx.plot.findUnique({ where: { id }, select: { id: true, plotNumber: true, status: true, archived: true } });
      if (!plot) throw new NotFoundException('Plot not found');
      if (plot.archived) throw new BadRequestException('Archived plots cannot be held.');
      if (!canPlaceManualHold(plot.status)) {
        throw new ConflictException(`Plot cannot be held (current status: ${plot.status}).`);
      }
      const updated = await tx.plot.updateMany({
        where: { id, status: 'AVAILABLE' },
        data: { status: 'RESERVED', customerId },
      });
      if (updated.count === 0) throw new ConflictException('Plot is no longer available.');
      const detail = serializeHoldDetail({
        type: 'MANUAL_HOLD',
        customerId,
        reason: body.reason?.trim() || undefined,
        notes: body.notes?.trim() || undefined,
        holdUntil: body.holdUntil?.trim() || undefined,
      });
      await tx.plotEvent.create({ data: { plotId: id, action: 'HOLD', detail } });
      await this.audit.log({
        action: 'UPDATE',
        entity: 'plot',
        entityId: id,
        summary: `Plot ${plot.plotNumber} held for ${customer.name}`,
      });
      return tx.plot.findUnique({ where: { id }, include: this.plotInclude });
    });
  }

  @Post('plots/:id/release-hold')
  async releasePlotHold(@Param('id') id: string) {
    return this.prisma.$transaction(async (tx) => {
      const plot = await tx.plot.findUnique({
        where: { id },
        select: { id: true, plotNumber: true, status: true, archived: true },
      });
      if (!plot) throw new NotFoundException('Plot not found');
      if (plot.archived) throw new BadRequestException('Archived plots cannot be updated.');
      const reservationCount = await tx.plotQuotation.count({
        where: { plotId: id, status: 'RESERVATION' },
      });
      if (!canReleaseManualHold(plot.status, reservationCount > 0)) {
        throw new ConflictException(
          reservationCount > 0
            ? 'This plot is reserved via a quotation. Void or complete that workflow first.'
            : `Plot hold cannot be released (status: ${plot.status}).`,
        );
      }
      const updated = await tx.plot.updateMany({
        where: { id, status: 'RESERVED' },
        data: { status: 'AVAILABLE', customerId: null },
      });
      if (updated.count === 0) throw new ConflictException('Plot is not on hold.');
      await tx.plotEvent.create({ data: { plotId: id, action: 'HOLD_RELEASED', detail: 'Manual hold released' } });
      await this.audit.log({
        action: 'UPDATE',
        entity: 'plot',
        entityId: id,
        summary: `Plot ${plot.plotNumber} hold released`,
      });
      return tx.plot.findUnique({ where: { id }, include: this.plotInclude });
    });
  }

  @Post('plots')
  async createPlot(@Body() body: Record<string, unknown>) {
    try {
      const input = parsePlotWrite(body, false);
      await this.assertPlotProjectAllowsWrite(input.projectId, true);
      const row = await this.prisma.plot.create({
        data: this.plotDataFromWrite(input) as never,
        include: this.plotInclude,
      });
      await this.logPlotEvent(row.id, 'CREATED', `Plot ${row.plotNumber} added`);
      await this.audit.log({ action: 'CREATE', entity: 'plot', entityId: row.id, summary: `Plot ${row.plotNumber} created` });
      return row;
    } catch (err) {
      this.handlePlotWriteError(err);
    }
  }

  @Patch('plots/:id')
  async updatePlot(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    try {
      const existing = await this.prisma.plot.findUnique({
        where: { id },
        select: { projectId: true, status: true, customerId: true, areaSqft: true, pricePerSqftInr: true, plotNumber: true },
      });
      if (!existing) throw new NotFoundException('Plot not found');
      const input = parsePlotWrite(body, true);
      if (input.projectId !== undefined) await this.assertPlotProjectAllowsWrite(input.projectId, true);
      if (input.status === 'RESERVED' || input.status === 'SOLD') {
        if (input.customerId === undefined && !existing.customerId) {
          throw new BadRequestException('Assign a customer before reserving or marking sold.');
        }
      }
      const row = await this.prisma.plot.update({
        where: { id },
        data: this.plotDataFromWrite(input, existing) as never,
        include: this.plotInclude,
      });
      if (input.pricePerSqftInr !== undefined || input.priceInr !== undefined) {
        await this.logPlotEvent(id, 'PRICE_UPDATE', `Rate or base price updated for plot ${row.plotNumber}`);
      }
      if (input.status !== undefined && input.status !== existing.status) {
        await this.logPlotEvent(id, 'STATUS', `${existing.status} → ${input.status}`);
      }
      await this.audit.log({ action: 'UPDATE', entity: 'plot', entityId: id, summary: `Plot ${row.plotNumber} updated` });
      return row;
    } catch (err) {
      this.handlePlotWriteError(err);
    }
  }

  @Delete('plots/:id')
  async deletePlot(@Param('id') id: string) {
    const existing = await this.prisma.plot.findUnique({
      where: { id },
      include: { project: { select: { name: true } }, customer: { select: { id: true } } },
    });
    if (!existing) throw new NotFoundException('Plot not found');
    const mustArchive = Boolean(existing.customerId) || existing.status === 'SOLD' || existing.status === 'RESERVED';
    if (mustArchive) {
      await this.prisma.plot.update({ where: { id }, data: { archived: true } });
      await this.audit.log({
        action: 'UPDATE',
        entity: 'plot',
        entityId: id,
        summary: `Plot ${existing.plotNumber} archived (${existing.project?.name ?? 'no project'})`,
      });
      return { ok: true, archived: true };
    }
    await this.prisma.plot.delete({ where: { id } });
    await this.audit.log({
      action: 'DELETE',
      entity: 'plot',
      entityId: id,
      summary: `Plot ${existing.plotNumber} deleted`,
    });
    return { ok: true, archived: false };
  }

  @Get('expenses')
  expenses() {
    return this.prisma.expense.findMany({ orderBy: { expenseDate: 'desc' } });
  }

  @Post('expenses')
  createExpense(
    @Body()
    body: { category: string; amountInr: number; description?: string; expenseDate?: string },
  ) {
    return this.prisma.expense.create({
      data: {
        category: body.category as never,
        amountInr: body.amountInr,
        description: body.description,
        expenseDate: body.expenseDate ? new Date(body.expenseDate) : new Date(),
      },
    });
  }

  @Get('expenses/:id')
  expense(@Param('id') id: string) {
    return this.prisma.expense.findUniqueOrThrow({ where: { id } });
  }

  @Patch('expenses/:id')
  updateExpense(
    @Param('id') id: string,
    @Body() body: { category?: string; amountInr?: number; description?: string; expenseDate?: string },
  ) {
    return this.prisma.expense.update({
      where: { id },
      data: {
        ...(body.category ? { category: body.category as never } : {}),
        ...(body.amountInr !== undefined ? { amountInr: body.amountInr } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.expenseDate ? { expenseDate: new Date(body.expenseDate) } : {}),
      },
    });
  }

  @Delete('expenses/:id')
  deleteExpense(@Param('id') id: string) {
    return this.prisma.expense.delete({ where: { id } });
  }

  @Get('accounts')
  accounts() {
    return this.prisma.account.findMany({ orderBy: { code: 'asc' } });
  }

  @Post('accounts')
  createAccount(@Body() body: { code: string; name: string; type: string }) {
    return this.prisma.account.create({ data: body as never });
  }

  @Get('journal')
  journal() {
    return this.prisma.journalEntry.findMany({
      orderBy: { entryDate: 'desc' },
      take: 100,
      include: { lines: { include: { account: true } } },
    });
  }

  @Post('journal')
  async createJournal(@Body() body: Record<string, unknown>) {
    try {
      const input = parseJournalWrite(body);
      const row = await this.prisma.journalEntry.create({
        data: {
          entryDate: input.entryDate,
          narration: input.narration,
          lines: {
            create: input.lines.map((l) => ({
              accountId: l.accountId,
              debitInr: l.debitInr ?? 0,
              creditInr: l.creditInr ?? 0,
            })),
          },
        },
        include: { lines: { include: { account: true } } },
      });
      await this.audit.log({
        action: 'CREATE',
        entity: 'journal_entry',
        entityId: row.id,
        summary: `Journal posted (${input.lines.length} lines)`,
      });
      return row;
    } catch (err) {
      if (err instanceof JournalValidationError) throw new BadRequestException(err.message);
      throw err;
    }
  }

  @Get('inventory')
  @JewelleryUnit()
  inventory() {
    return this.prisma.stockItem.findMany({ orderBy: { name: 'asc' } });
  }

  @Post('inventory/adjust')
  @JewelleryUnit()
  adjustInventory(
    @Body()
    body: { sku: string; name: string; delta: number; unit?: string; movement: 'IN' | 'OUT' | 'TRANSFER' },
  ) {
    const unit = body.unit ?? 'g';
    return this.prisma.stockItem.upsert({
      where: { sku: body.sku },
      create: { sku: body.sku, name: body.name, quantity: Math.max(0, body.delta), unit },
      update: {
        name: body.name,
        quantity: {
          increment: body.movement === 'OUT' ? -Math.abs(body.delta) : Math.abs(body.delta),
        },
      },
    });
  }

  @Get('reports/summary')
  async reportSummary() {
    const [expenseSum, revenueSum, plotCounts] = await Promise.all([
      this.prisma.expense.aggregate({ _sum: { amountInr: true } }),
      this.prisma.invoice.aggregate({ _sum: { totalInr: true }, where: { type: 'SALE' } }),
      this.prisma.plot.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    return {
      expensesTotal: Number(expenseSum._sum.amountInr ?? 0),
      revenueTotal: Number(revenueSum._sum.totalInr ?? 0),
      plotsByStatus: Object.fromEntries(plotCounts.map((p) => [p.status, p._count._all])),
    };
  }

  @Get('commission-rate-effective')
  @Roles(...COMMISSION_READ_ROLES)
  async commissionRateEffective(@Query('brokerId') brokerId?: string, @Query('projectId') projectId?: string) {
    if (!brokerId) throw new BadRequestException('brokerId is required');
    return this.commissionRates.resolveEffectiveRate({ brokerId, projectId: projectId || null });
  }

  @Get('brokers')
  @Roles(...COMMISSION_READ_ROLES)
  async brokers(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('q') q?: string,
    @Query('active') active?: string,
  ) {
    if (!page) {
      const where: Prisma.BrokerWhereInput = {};
      if (active === '1') where.isActive = true;
      if (active === '0') where.isActive = false;
      const term = q?.trim();
      if (term) {
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term, mode: 'insensitive' } },
          { code: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ];
      }
      return this.prisma.broker.findMany({
        where,
        orderBy: { name: 'asc' },
        include: { _count: { select: { commissions: true, properties: true, plots: true } } },
      });
    }
    const p = Math.max(1, Number(page) || 1);
    const size = Math.min(Math.max(Number(pageSize) || 25, 1), 100);
    const where: Prisma.BrokerWhereInput = {};
    if (active === '1') where.isActive = true;
    if (active === '0') where.isActive = false;
    const term = q?.trim();
    if (term) {
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { code: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [total, data] = await Promise.all([
      this.prisma.broker.count({ where }),
      this.prisma.broker.findMany({
        where,
        skip: (p - 1) * size,
        take: size,
        orderBy: { name: 'asc' },
        include: { _count: { select: { commissions: true, properties: true } } },
      }),
    ]);
    return { data, page: p, pageSize: size, total, totalPages: Math.max(1, Math.ceil(total / size)) };
  }

  @Get('brokers/:id')
  @Roles(...COMMISSION_READ_ROLES)
  async brokerDetail(@Param('id') id: string) {
    const broker = await this.prisma.broker.findUnique({
      where: { id },
      include: {
        _count: { select: { commissions: true, plots: true, plotQuotations: true } },
        commissions: {
          where: { voided: false },
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: { id: true, expectedInr: true, paidInr: true, status: true, createdAt: true },
        },
      },
    });
    if (!broker) throw new NotFoundException('Broker not found');
    const totals = broker.commissions.reduce(
      (acc, c) => {
        acc.expected += Number(c.expectedInr);
        acc.paid += Number(c.paidInr);
        return acc;
      },
      { expected: 0, paid: 0 },
    );
    const effective = await this.commissionRates.resolveEffectiveRate({ brokerId: id });
    return {
      ...broker,
      effectiveCommission: effective,
      totals: {
        expected: Math.round(totals.expected * 100) / 100,
        paid: Math.round(totals.paid * 100) / 100,
        outstanding: Math.round(Math.max(0, totals.expected - totals.paid) * 100) / 100,
      },
    };
  }

  @Post('brokers')
  @Roles(...COMMISSION_WRITE_ROLES)
  async createBroker(
    @Body()
    body: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      code?: string;
      notes?: string;
      commissionKind?: 'PERCENTAGE' | 'FIXED';
      commissionRate?: number | null;
    },
  ) {
    const name = body.name?.trim();
    const phone = body.phone?.trim();
    if (!name || name.length < 2) throw new BadRequestException('Broker name is required');
    if (!phone || phone.length < 8) throw new BadRequestException('A valid phone number is required');
    const code = body.code?.trim() || null;
    if (code) {
      const dup = await this.prisma.broker.findFirst({ where: { code } });
      if (dup) throw new BadRequestException('Broker code already in use');
    }
    let commissionKind = body.commissionKind ?? null;
    let commissionRate: number | null = body.commissionRate != null ? Number(body.commissionRate) : null;
    if (commissionKind && commissionRate != null) {
      commissionRate = this.commissionRates.validateRate(commissionKind, commissionRate);
    } else {
      commissionKind = null;
      commissionRate = null;
    }
    return this.prisma.broker.create({
      data: {
        name,
        phone,
        code,
        address: body.address?.trim() || null,
        email: body.email?.trim() || null,
        notes: body.notes?.trim() || null,
        commissionKind,
        commissionRate,
      },
    });
  }

  @Patch('brokers/:id')
  @Roles(...COMMISSION_WRITE_ROLES)
  async updateBroker(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      code?: string;
      notes?: string;
      isActive?: boolean;
      commissionKind?: 'PERCENTAGE' | 'FIXED' | null;
      commissionRate?: number | null;
    },
  ) {
    const current = await this.prisma.broker.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Broker not found');
    const code = body.code !== undefined ? body.code?.trim() || null : undefined;
    if (code) {
      const dup = await this.prisma.broker.findFirst({ where: { code, NOT: { id } } });
      if (dup) throw new BadRequestException('Broker code already in use');
    }
    let commissionKind = body.commissionKind;
    let commissionRate = body.commissionRate;
    if (body.commissionKind !== undefined || body.commissionRate !== undefined) {
      if (commissionKind == null || commissionRate == null) {
        commissionKind = null;
        commissionRate = null;
      } else {
        commissionRate = this.commissionRates.validateRate(commissionKind, Number(commissionRate));
      }
      await this.commissionRates.auditBrokerRateChange(
        id,
        { kind: commissionKind, rate: commissionRate },
        { kind: current.commissionKind, rate: current.commissionRate != null ? Number(current.commissionRate) : null },
      );
    }
    return this.prisma.broker.update({
      where: { id },
      data: {
        ...(body.name ? { name: body.name.trim() } : {}),
        ...(body.phone ? { phone: body.phone.trim() } : {}),
        ...(body.email !== undefined ? { email: body.email.trim() || null } : {}),
        ...(body.address !== undefined ? { address: body.address.trim() || null } : {}),
        ...(code !== undefined ? { code } : {}),
        ...(body.notes !== undefined ? { notes: body.notes.trim() || null } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        ...(body.commissionKind !== undefined ? { commissionKind } : {}),
        ...(body.commissionRate !== undefined ? { commissionRate } : {}),
      },
    });
  }

  @Get('commissions')
  @Roles(...COMMISSION_READ_ROLES)
  commissions() {
    return this.prisma.commission.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        broker: { select: { id: true, name: true } },
        property: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  @Post('commissions')
  @Roles(...COMMISSION_WRITE_ROLES)
  async createCommission(
    @Body()
    body: {
      brokerId?: string;
      propertyId?: string;
      projectId?: string;
      kind?: 'PERCENTAGE' | 'FIXED';
      rate?: number;
      saleValueInr?: number | null;
      paidInr?: number;
      notes?: string;
    },
  ) {
    if (!body.brokerId) throw new BadRequestException('Choose a broker');
    if (body.kind !== 'PERCENTAGE' && body.kind !== 'FIXED') throw new BadRequestException('Choose percentage or fixed commission');
    const expected = commissionExpected(body.kind, Number(body.rate), body.saleValueInr ?? null);
    const paid = Number(body.paidInr ?? 0);
    if (!Number.isFinite(paid) || paid < 0) throw new BadRequestException('Paid amount must be zero or more');
    return this.prisma.commission.create({
      data: {
        brokerId: body.brokerId,
        propertyId: body.propertyId || null,
        projectId: body.projectId || null,
        kind: body.kind,
        rate: Number(body.rate),
        rateSource: CommissionRateSource.MANUAL,
        calculationBasis: 'BASE_PLOT',
        saleValueInr: body.saleValueInr ?? null,
        expectedInr: expected,
        paidInr: paid,
        status: commissionStatus(expected, paid),
        notes: body.notes?.trim() || null,
        paidOn: paid > 0 ? new Date() : null,
      },
    });
  }

  @Patch('commissions/:id')
  @Roles(...COMMISSION_WRITE_ROLES)
  async updateCommission(@Param('id') id: string, @Body() body: { paidInr?: number; notes?: string }) {
    const current = await this.prisma.commission.findUniqueOrThrow({ where: { id } });
    const paid = body.paidInr === undefined ? Number(current.paidInr) : Number(body.paidInr);
    if (!Number.isFinite(paid) || paid < 0) throw new BadRequestException('Paid amount must be zero or more');
    const expected = Number(current.expectedInr);
    return this.prisma.commission.update({
      where: { id },
      data: {
        paidInr: paid,
        status: commissionStatus(expected, paid),
        notes: body.notes === undefined ? current.notes : body.notes.trim() || null,
        paidOn: paid > 0 ? current.paidOn ?? new Date() : null,
      },
    });
  }
}
