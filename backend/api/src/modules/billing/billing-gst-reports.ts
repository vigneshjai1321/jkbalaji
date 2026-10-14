import { InvoiceStatus } from '../../generated/prisma/client.js';
import type { PrismaService } from '../../database/prisma.service.js';

export type GstReportRange = { from: Date; to: Date; label: string };

export function resolveReportRange(preset?: string, fromStr?: string, toStr?: string): GstReportRange {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  if (fromStr && toStr) {
    return { from: startOfDay(new Date(fromStr)), to: endOfDay(new Date(toStr)), label: 'Custom range' };
  }

  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now), label: 'Today' };
    case 'prev_month': {
      const m = now.getMonth() - 1;
      const y = m < 0 ? now.getFullYear() - 1 : now.getFullYear();
      const month = (m + 12) % 12;
      const from = new Date(y, month, 1);
      const to = endOfDay(new Date(y, month + 1, 0));
      return { from, to, label: 'Previous month' };
    }
    case 'fy': {
      const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      const from = new Date(fyStartYear, 3, 1);
      const to = endOfDay(new Date(fyStartYear + 1, 2, 31));
      return { from, to, label: 'Financial year (Apr–Mar)' };
    }
    case 'month':
    default: {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: endOfDay(now), label: 'This month' };
    }
  }
}

const ACTIVE_STATUSES: InvoiceStatus[] = [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.PAID];

export async function buildGstReport(prisma: PrismaService, range: GstReportRange) {
  const invoices = await prisma.invoice.findMany({
    where: {
      invoiceDate: { gte: range.from, lte: range.to },
      status: { in: ACTIVE_STATUSES },
    },
    include: { customer: true, lines: true },
    orderBy: { invoiceDate: 'desc' },
  });

  const allInRange = await prisma.invoice.findMany({
    where: { invoiceDate: { gte: range.from, lte: range.to } },
    select: { status: true, gstApplied: true },
  });

  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let taxable = 0;
  let invoiceValue = 0;
  let gstInvoiceCount = 0;
  let nonGstInvoiceCount = 0;

  const rows = invoices.map((inv) => {
    const sub = Number(inv.subtotalInr) - Number(inv.discountInr);
    taxable += sub;
    invoiceValue += Number(inv.totalInr);
    cgst += Number(inv.cgstInr);
    sgst += Number(inv.sgstInr);
    igst += Number(inv.igstInr);
    if (inv.gstApplied) gstInvoiceCount += 1;
    else nonGstInvoiceCount += 1;

    const taxTotal = Number(inv.cgstInr) + Number(inv.sgstInr) + Number(inv.igstInr);
    const effectiveRate = sub > 0 ? (taxTotal / sub) * 100 : 0;

    return {
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      invoiceDate: inv.invoiceDate,
      customerName: inv.customer.name,
      gstApplied: inv.gstApplied,
      taxableInr: sub,
      cgstInr: Number(inv.cgstInr),
      sgstInr: Number(inv.sgstInr),
      igstInr: Number(inv.igstInr),
      totalInr: Number(inv.totalInr),
      taxRatePct: Math.round(effectiveRate * 100) / 100,
      status: inv.status,
    };
  });

  const statusBreakdown = {
    draft: allInRange.filter((i) => i.status === InvoiceStatus.DRAFT).length,
    issued: allInRange.filter((i) => ACTIVE_STATUSES.includes(i.status)).length,
    cancelled: allInRange.filter((i) => i.status === InvoiceStatus.CANCELLED).length,
    paid: allInRange.filter((i) => i.status === InvoiceStatus.PAID).length,
  };

  const monthly = bucketMonthly(invoices);
  const quarterly = bucketQuarterly(invoices);

  return {
    range,
    disclaimer: 'Internal summary from issued invoices in this system. Not a filed GSTR-1/GSTR-3B return.',
    totals: {
      cgstInr: round2(cgst),
      sgstInr: round2(sgst),
      igstInr: round2(igst),
      gstCollectedInr: round2(cgst + sgst + igst),
      taxableSalesInr: round2(taxable),
      invoiceValueInr: round2(invoiceValue),
      gstInvoiceCount,
      nonGstInvoiceCount,
    },
    statusBreakdown,
    invoices: rows,
    monthly,
    quarterly,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function bucketMonthly(invoices: Array<{ invoiceDate: Date; cgstInr: unknown; sgstInr: unknown; igstInr: unknown; totalInr: unknown; gstApplied: boolean }>) {
  const map = new Map<string, { label: string; gst: number; total: number; count: number }>();
  for (const inv of invoices) {
    const d = inv.invoiceDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const cur = map.get(key) ?? { label, gst: 0, total: 0, count: 0 };
    cur.gst += Number(inv.cgstInr) + Number(inv.sgstInr) + Number(inv.igstInr);
    cur.total += Number(inv.totalInr);
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, gst: round2(v.gst), total: round2(v.total) }));
}

function bucketQuarterly(invoices: Array<{ invoiceDate: Date; cgstInr: unknown; sgstInr: unknown; igstInr: unknown; totalInr: unknown }>) {
  const map = new Map<string, { label: string; gst: number; total: number; count: number }>();
  for (const inv of invoices) {
    const d = inv.invoiceDate;
    const q = Math.floor(d.getMonth() / 3) + 1;
    const key = `${d.getFullYear()}-Q${q}`;
    const label = `Q${q} ${d.getFullYear()}`;
    const cur = map.get(key) ?? { label, gst: 0, total: 0, count: 0 };
    cur.gst += Number(inv.cgstInr) + Number(inv.sgstInr) + Number(inv.igstInr);
    cur.total += Number(inv.totalInr);
    cur.count += 1;
    map.set(key, cur);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => ({ ...v, gst: round2(v.gst), total: round2(v.total) }));
}

export function gstReportToCsv(report: Awaited<ReturnType<typeof buildGstReport>>): string {
  const lines = [
    'Invoice No,Date,Customer,GST Applied,Taxable,CGST,SGST,IGST,Total,Tax Rate %,Status',
    ...report.invoices.map((r) =>
      [
        r.invoiceNo,
        new Date(r.invoiceDate).toISOString().slice(0, 10),
        `"${r.customerName.replace(/"/g, '""')}"`,
        r.gstApplied ? 'Yes' : 'No',
        r.taxableInr,
        r.cgstInr,
        r.sgstInr,
        r.igstInr,
        r.totalInr,
        r.taxRatePct,
        r.status,
      ].join(','),
    ),
  ];
  return lines.join('\n');
}
