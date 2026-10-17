import type { TaxMode } from '../../generated/prisma/client.js';

export type LineInput = {
  description: string;
  hsnSac?: string;
  unit?: string;
  qty: number;
  rateInr: number;
  discountInr?: number;
  gstRatePct?: number;
};

export type ComputedLine = LineInput & {
  taxableInr: number;
  cgstInr: number;
  sgstInr: number;
  igstInr: number;
  amountInr: number;
};

export type InvoiceTotals = {
  subtotalInr: number;
  discountInr: number;
  cgstInr: number;
  sgstInr: number;
  igstInr: number;
  totalInr: number;
  taxMode: TaxMode;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function gstStateFromGstin(gstin?: string | null): string | null {
  if (!gstin || gstin.length < 2) return null;
  const code = gstin.slice(0, 2);
  return /^\d{2}$/.test(code) ? code : null;
}

export function resolveTaxMode(sellerStateCode: string | null, customerStateCode: string | null): TaxMode {
  if (sellerStateCode && customerStateCode && sellerStateCode !== customerStateCode) {
    return 'IGST';
  }
  return 'CGST_SGST';
}

export function computeLines(
  lines: LineInput[],
  taxMode: TaxMode,
  applyGst = true,
): { lines: ComputedLine[]; totals: InvoiceTotals } {
  const computed: ComputedLine[] = lines.map((l) => {
    const qty = Number(l.qty) || 0;
    const rate = Number(l.rateInr) || 0;
    const lineDiscount = Number(l.discountInr) || 0;
    const gstRate = applyGst ? Number(l.gstRatePct ?? 0) || 0 : 0;
    const gross = qty * rate;
    const taxable = round2(Math.max(0, gross - lineDiscount));
    const gstTotal = round2(taxable * (gstRate / 100));
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    if (taxMode === 'IGST') {
      igst = gstTotal;
    } else {
      cgst = round2(gstTotal / 2);
      sgst = round2(gstTotal - cgst);
    }
    const amount = round2(taxable + cgst + sgst + igst);
    return {
      ...l,
      taxableInr: taxable,
      cgstInr: cgst,
      sgstInr: sgst,
      igstInr: igst,
      amountInr: amount,
    };
  });

  const subtotalInr = round2(computed.reduce((s, l) => s + l.qty * l.rateInr, 0));
  const discountInr = round2(computed.reduce((s, l) => s + (l.discountInr ?? 0), 0));
  const cgstInr = round2(computed.reduce((s, l) => s + l.cgstInr, 0));
  const sgstInr = round2(computed.reduce((s, l) => s + l.sgstInr, 0));
  const igstInr = round2(computed.reduce((s, l) => s + l.igstInr, 0));
  const totalInr = round2(computed.reduce((s, l) => s + l.amountInr, 0));

  return {
    lines: computed,
    totals: { subtotalInr, discountInr, cgstInr, sgstInr, igstInr, totalInr, taxMode },
  };
}

export function paymentStatus(totalInr: number, amountPaidInr: number): 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' {
  const paid = round2(amountPaidInr);
  const total = round2(totalInr);
  if (paid <= 0) return 'UNPAID';
  if (paid >= total) return 'PAID';
  return 'PARTIALLY_PAID';
}

/** Customer-facing label. Partial balances stay Unpaid; status is never forced ahead of recorded payments. */
export function invoicePaymentLabel(status: string, totalInr: number, amountPaidInr: number): 'Paid' | 'Unpaid' | 'Cancelled' {
  if (status === 'CANCELLED') return 'Cancelled';
  return paymentStatus(totalInr, amountPaidInr) === 'PAID' ? 'Paid' : 'Unpaid';
}
