import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '../../generated/prisma/client.js';

export const DEFAULT_INVOICE_PREFIX = 'SBT-INV';

export function normalizeInvoicePrefix(raw?: string): string {
  const p = (raw?.trim() || DEFAULT_INVOICE_PREFIX).replace(/\s+/g, '-').toUpperCase();
  return p.replace(/[^A-Z0-9-]/g, '') || DEFAULT_INVOICE_PREFIX;
}

export function formatInvoiceNo(prefix: string, calendarYear: number, seq: number): string {
  return `${normalizeInvoicePrefix(prefix)}-${calendarYear}-${String(seq).padStart(4, '0')}`;
}

export type ParsedInvoiceNo = { prefix: string; year: number; seq: number; raw: string };

export function parseInvoiceNo(invoiceNo: string, expectedPrefix?: string): ParsedInvoiceNo | null {
  const raw = invoiceNo.trim().toUpperCase();
  const prefix = normalizeInvoicePrefix(expectedPrefix);
  const re = new RegExp(`^(${prefix.replace(/-/g, '\\-')})-(\\d{4})-(\\d{4})$`);
  const m = raw.match(re);
  if (!m) return null;
  const year = Number(m[2]);
  const seq = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(seq) || seq < 1 || seq > 9999) return null;
  return { prefix: m[1]!, year, seq, raw };
}

export function assertInvoiceNoFormat(invoiceNo: string, expectedPrefix?: string): ParsedInvoiceNo {
  const parsed = parseInvoiceNo(invoiceNo, expectedPrefix);
  if (!parsed) {
    throw new BadRequestException(
      `Invoice number must match ${normalizeInvoicePrefix(expectedPrefix)}-YYYY-0001 (example: ${formatInvoiceNo(expectedPrefix ?? DEFAULT_INVOICE_PREFIX, new Date().getFullYear(), 1)}).`,
    );
  }
  return parsed;
}

export function isLegacyDraftNo(invoiceNo: string): boolean {
  return /^DRAFT-/i.test(invoiceNo.trim());
}

export async function maxAssignedSeqForYear(
  tx: Prisma.TransactionClient,
  calendarYear: number,
  prefix: string,
): Promise<number> {
  const p = normalizeInvoicePrefix(prefix);
  const rows = await tx.invoice.findMany({
    where: { invoiceNo: { startsWith: `${p}-${calendarYear}-` } },
    select: { invoiceNo: true },
  });
  let max = 0;
  for (const row of rows) {
    const parsed = parseInvoiceNo(row.invoiceNo, p);
    if (parsed?.year === calendarYear) max = Math.max(max, parsed.seq);
  }
  return max;
}

export async function syncSequenceForYear(
  tx: Prisma.TransactionClient,
  calendarYear: number,
  prefix: string,
): Promise<void> {
  const maxFromInvoices = await maxAssignedSeqForYear(tx, calendarYear, prefix);
  const existing = await tx.invoiceSequence.findUnique({ where: { fiscalYear: calendarYear } });
  const current = existing?.lastNumber ?? 0;
  if (maxFromInvoices <= current) return;
  await tx.invoiceSequence.upsert({
    where: { fiscalYear: calendarYear },
    create: { fiscalYear: calendarYear, lastNumber: maxFromInvoices },
    update: { lastNumber: maxFromInvoices },
  });
}

/** Read-only suggestion — does not reserve a number. */
export async function suggestNextInvoiceNo(
  prisma: { invoiceSequence: Prisma.TransactionClient['invoiceSequence']; invoice: Prisma.TransactionClient['invoice'] },
  invoiceDate: Date,
  prefix: string,
): Promise<string> {
  const year = invoiceDate.getFullYear();
  const p = normalizeInvoicePrefix(prefix);
  const seqRow = await prisma.invoiceSequence.findUnique({ where: { fiscalYear: year } });
  let max = seqRow?.lastNumber ?? 0;
  const rows = await prisma.invoice.findMany({
    where: { invoiceNo: { startsWith: `${p}-${year}-` } },
    select: { invoiceNo: true },
  });
  for (const row of rows) {
    const parsed = parseInvoiceNo(row.invoiceNo, p);
    if (parsed?.year === year) max = Math.max(max, parsed.seq);
  }
  return formatInvoiceNo(p, year, max + 1);
}

export async function allocateInvoiceNo(
  tx: Prisma.TransactionClient,
  invoiceDate: Date,
  prefix: string,
  opts?: { preferred?: string | null; excludeInvoiceId?: string },
): Promise<string> {
  const year = invoiceDate.getFullYear();
  const p = normalizeInvoicePrefix(prefix);
  await syncSequenceForYear(tx, year, p);

  const preferred = opts?.preferred?.trim();
  if (preferred && !isLegacyDraftNo(preferred)) {
    const parsed = assertInvoiceNoFormat(preferred, p);
    if (parsed.year !== year) {
      throw new BadRequestException(`Invoice number year must match invoice date (${year}).`);
    }
    const taken = await tx.invoice.findFirst({
      where: {
        invoiceNo: parsed.raw,
        ...(opts?.excludeInvoiceId ? { NOT: { id: opts.excludeInvoiceId } } : {}),
      },
    });
    if (taken) {
      throw new BadRequestException(`Invoice number ${parsed.raw} is already in use.`);
    }
    const seqRow = await tx.invoiceSequence.findUnique({ where: { fiscalYear: year } });
    const nextLast = Math.max(seqRow?.lastNumber ?? 0, parsed.seq);
    await tx.invoiceSequence.upsert({
      where: { fiscalYear: year },
      create: { fiscalYear: year, lastNumber: nextLast },
      update: { lastNumber: nextLast },
    });
    return parsed.raw;
  }

  const seq = await tx.invoiceSequence.upsert({
    where: { fiscalYear: year },
    create: { fiscalYear: year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return formatInvoiceNo(p, year, seq.lastNumber);
}
