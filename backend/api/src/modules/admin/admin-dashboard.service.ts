import { Injectable } from '@nestjs/common';
import { InvoiceType } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [
      properties,
      products,
      leads,
      customers,
      invoices,
      users,
      activeUsers,
      pendingFollowups,
      revenueAll,
      revenueToday,
      revenueMonth,
      revenueYear,
      expensesMonth,
      expensesTotal,
      plotCount,
      stockAgg,
      recentLeads,
      recentInvoices,
      latestGoldRate,
      leadGroups,
      invoiceMonthGroups,
      propertyStatusGroups,
      recentActivity,
      notifications,
      projects,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.jewelleryProduct.count(),
      this.prisma.lead.count(),
      this.prisma.customer.count(),
      this.prisma.invoice.count(),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.safe(
        () =>
          this.prisma.leadFollowup.count({
            where: { completedAt: null, dueAt: { lte: new Date(now.getTime() + 7 * 86400000) } },
          }),
        0,
      ),
      this.prisma.invoice.aggregate({ _sum: { totalInr: true }, where: { type: InvoiceType.SALE } }),
      this.prisma.invoice.aggregate({
        _sum: { totalInr: true },
        where: { type: InvoiceType.SALE, invoiceDate: { gte: dayStart } },
      }),
      this.prisma.invoice.aggregate({
        _sum: { totalInr: true },
        where: { type: InvoiceType.SALE, invoiceDate: { gte: monthStart } },
      }),
      this.prisma.invoice.aggregate({
        _sum: { totalInr: true },
        where: { type: InvoiceType.SALE, invoiceDate: { gte: yearStart } },
      }),
      this.safe(
        () =>
          this.prisma.expense.aggregate({
            _sum: { amountInr: true },
            where: { expenseDate: { gte: monthStart } },
          }),
        { _sum: { amountInr: null } },
      ),
      this.safe(() => this.prisma.expense.aggregate({ _sum: { amountInr: true } }), { _sum: { amountInr: null } }),
      this.safe(() => this.prisma.plot.count(), 0),
      this.safe(
        () => this.prisma.stockItem.aggregate({ _sum: { quantity: true }, _count: { _all: true } }),
        { _sum: { quantity: null }, _count: { _all: 0 } },
      ),
      this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { property: true } }),
      this.prisma.invoice.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { customer: true } }),
      this.prisma.goldRate.findFirst({ orderBy: { effectiveDate: 'desc' } }),
      this.prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.invoice.findMany({
        where: { type: InvoiceType.SALE, invoiceDate: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } },
        select: { invoiceDate: true, totalInr: true },
      }),
      this.prisma.property.groupBy({ by: ['status'], _count: { _all: true } }),
      this.safe(() =>
        this.prisma.activityLog.findMany({
          orderBy: { createdAt: 'desc' },
          take: 15,
          include: { user: { select: { name: true, email: true } } },
        }),
      ),
      this.safe(() =>
        this.prisma.notification.findMany({
          where: { OR: [{ userId: null }, { readAt: null }] },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ),
      this.safe(() => this.prisma.project.count(), 0),
    ]);

    const recentLoginLogs = await this.safe(() =>
      this.prisma.loginLog.findMany({
        where: { success: true },
        orderBy: { loginAt: 'desc' },
        take: 8,
        include: { user: { select: { name: true, email: true } } },
      }),
    );

    const [reLeads, jewLeads, reLeadsNew, schemesActive] = await Promise.all([
      this.prisma.lead.count({ where: { site: 'REAL_ESTATE' } }),
      this.prisma.lead.count({ where: { site: 'JEWELLERY' } }),
      this.prisma.lead.count({ where: { site: 'REAL_ESTATE', status: 'NEW' } }),
      this.safe(() => this.prisma.jewelleryScheme.count({ where: { isActive: true } }), 0),
    ]);

    const leadsNew = leadGroups.find((g) => g.status === 'NEW')?._count._all ?? 0;
    const leadsByStatus = Object.fromEntries(leadGroups.map((g) => [g.status, g._count._all]));
    const propertiesByStatus = Object.fromEntries(propertyStatusGroups.map((g) => [g.status, g._count._all]));

    const monthBuckets = new Map<string, number>();
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthBuckets.set(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, 0);
    }
    for (const inv of invoiceMonthGroups) {
      const d = new Date(inv.invoiceDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthBuckets.has(key)) monthBuckets.set(key, (monthBuckets.get(key) ?? 0) + Number(inv.totalInr));
    }

    const timeline = [
      ...recentLeads.map((l) => ({
        id: l.id,
        type: 'lead' as const,
        title: l.name,
        subtitle: `${l.site} · ${l.status}`,
        at: l.createdAt.toISOString(),
      })),
      ...recentInvoices.map((inv) => ({
        id: inv.id,
        type: 'invoice' as const,
        title: inv.invoiceNo,
        subtitle: `${inv.customer.name} · ₹${Number(inv.totalInr).toLocaleString('en-IN')}`,
        at: inv.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 12);

    const expensesMonthVal = Number(expensesMonth._sum.amountInr ?? 0);
    const expensesTotalVal = Number(expensesTotal._sum.amountInr ?? 0);
    const revenueYearVal = Number(revenueYear._sum.totalInr ?? 0);
    const revenueMonthVal = Number(revenueMonth._sum.totalInr ?? 0);

    return {
      revenueTotal: Number(revenueAll._sum.totalInr ?? 0),
      revenueToday: Number(revenueToday._sum.totalInr ?? 0),
      revenueMonth: revenueMonthVal,
      revenueYear: revenueYearVal,
      expensesMonth: expensesMonthVal,
      expensesTotal: expensesTotalVal,
      profitMonth: revenueMonthVal - expensesMonthVal,
      profitYear: revenueYearVal - expensesTotalVal,
      outstandingPayments: 0,
      plots: plotCount,
      inventoryValue: Number(stockAgg._sum.quantity ?? 0),
      inventorySkus: stockAgg._count._all ?? 0,
      goldSalesMonth: revenueMonthVal,
      properties,
      projects,
      products,
      leads,
      leadsNew,
      customers,
      invoices,
      users,
      activeUsers,
      pendingFollowups,
      goldRate: latestGoldRate
        ? {
            rate22k: Number(latestGoldRate.rate22k),
            rate24k: Number(latestGoldRate.rate24k),
            effectiveDate: latestGoldRate.effectiveDate.toISOString(),
          }
        : null,
      leadsByStatus,
      propertiesByStatus,
      revenueByMonth: [...monthBuckets.entries()].map(([month, total]) => ({ month, total })),
      recentActivity: timeline,
      activityLogs: (recentActivity ?? []).map((a) => ({
        id: a.id,
        action: a.action,
        entity: a.entity,
        summary: a.summary,
        user: a.user?.name ?? a.user?.email ?? 'System',
        at: a.createdAt.toISOString(),
      })),
      recentLoginLogs: (recentLoginLogs ?? []).map((l) => ({
        id: l.id,
        email: l.user?.email ?? l.emailAttempt ?? '—',
        name: l.user?.name ?? '—',
        ipAddress: l.ipAddress,
        browser: l.browser,
        device: l.device,
        at: l.loginAt.toISOString(),
      })),
      notifications: (notifications ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        readAt: n.readAt?.toISOString() ?? null,
        at: n.createdAt.toISOString(),
      })),
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        status: l.status,
        site: l.site,
        createdAt: l.createdAt.toISOString(),
      })),
      businessUnits: {
        overall: {
          revenueTotal: Number(revenueAll._sum.totalInr ?? 0),
          revenueMonth: Number(revenueMonth._sum.totalInr ?? 0),
          revenueToday: Number(revenueToday._sum.totalInr ?? 0),
          leads,
          customers,
          invoices,
          activeUsers,
        },
        realEstate: {
          properties,
          projects,
          leads: reLeads,
          leadsNew: reLeadsNew,
          ...(await this.realEstateFigures()),
        },
        jewellery: {
          products,
          leads: jewLeads,
          schemes: schemesActive,
          goldRate22k: latestGoldRate ? Number(latestGoldRate.rate22k) : null,
          stockSkus: stockAgg._count._all,
          stockValue: null as number | null,
        },
      },
    };
  }

  private async realEstateFigures() {
    const properties = await this.safe(() => this.prisma.property.findMany({
      select: { status: true, areaSqft: true, builtUpSqft: true },
    }), []);
    const sumArea = (rows: typeof properties, field: 'areaSqft' | 'builtUpSqft') => {
      let total = 0;
      let recorded = 0;
      for (const row of rows) {
        const value = row[field];
        if (value == null) continue;
        recorded += 1;
        total += Number(value);
      }
      return { total: Math.round(total * 100) / 100, recorded };
    };
    const land = sumArea(properties, 'areaSqft');
    const available = properties.filter((p) => p.status === 'AVAILABLE');
    const reserved = properties.filter((p) => p.status === 'BOOKED');
    const sold = properties.filter((p) => p.status === 'SOLD');
    const [activeProjects, completedProjects, archivedProjects, commissions] = await Promise.all([
      this.safe(() => this.prisma.project.count({ where: { lifecycle: { in: ['PLANNING', 'ACTIVE', 'ON_HOLD'] } } }), 0),
      this.safe(() => this.prisma.project.count({ where: { lifecycle: 'COMPLETED' } }), 0),
      this.safe(() => this.prisma.project.count({ where: { lifecycle: 'ARCHIVED' } }), 0),
      this.safe(() => this.prisma.commission.findMany({ select: { expectedInr: true, paidInr: true } }), []),
    ]);
    const expected = commissions.reduce((sum, row) => sum + Number(row.expectedInr), 0);
    const paid = commissions.reduce((sum, row) => sum + Number(row.paidInr), 0);
    const plots = await this.safe(
      () => this.prisma.plot.findMany({ where: { archived: false }, select: { status: true, areaSqft: true } }),
      [],
    );
    const plotArea = (list: typeof plots) =>
      Math.round(list.reduce((sum, row) => sum + (row.areaSqft ? Number(row.areaSqft) : 0), 0) * 100) / 100;
    const plotsAvailable = plots.filter((p) => p.status === 'AVAILABLE');
    const plotsReserved = plots.filter((p) => p.status === 'RESERVED');
    const plotsSold = plots.filter((p) => p.status === 'SOLD');
    return {
      available: available.length,
      reserved: reserved.length,
      sold: sold.length,
      plotTotal: plots.length,
      plotAvailable: plotsAvailable.length,
      plotReserved: plotsReserved.length,
      plotSold: plotsSold.length,
      plotTotalAreaSqft: plotArea(plots),
      plotAvailableAreaSqft: plotArea(plotsAvailable),
      plotSoldAreaSqft: plotArea(plotsSold),
      activeProjects,
      completedProjects,
      archivedProjects,
      recordedLandSqft: land.total,
      propertiesWithLandArea: land.recorded,
      propertiesMissingLandArea: properties.length - land.recorded,
      availableLandSqft: sumArea(available, 'areaSqft').total,
      soldLandSqft: sumArea(sold, 'areaSqft').total,
      recordedBuiltUpSqft: sumArea(properties, 'builtUpSqft').total,
      commissionExpected: Math.round(expected * 100) / 100,
      commissionPaid: Math.round(paid * 100) / 100,
      commissionOutstanding: Math.round(Math.max(0, expected - paid) * 100) / 100,
    };
  }

  private async safe<T>(fn: () => Promise<T>, fallback: T = [] as unknown as T): Promise<T> {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  }
}
