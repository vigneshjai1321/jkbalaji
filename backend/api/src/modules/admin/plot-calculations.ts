import { commissionExpected } from './measure.js';

export type PlotChargeInput = {
  label: string;
  kind: 'FIXED' | 'PERCENT';
  fixedAmountInr?: number | null;
  percentRate?: number | null;
  percentBase?: 'BASE_PLOT' | null;
};

export function roundInr(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeBasePlotPrice(areaSqft: number, pricePerSqftInr: number): number {
  if (!Number.isFinite(areaSqft) || areaSqft <= 0) throw new Error('Plot area must be greater than zero');
  if (!Number.isFinite(pricePerSqftInr) || pricePerSqftInr < 0) throw new Error('Price per sq ft must be zero or more');
  return roundInr(areaSqft * pricePerSqftInr);
}

export function computeChargeAmount(charge: PlotChargeInput, basePlotPriceInr: number): number {
  const label = charge.label?.trim() || 'Charge';
  if (charge.kind === 'FIXED') {
    const amt = Number(charge.fixedAmountInr ?? 0);
    if (!Number.isFinite(amt) || amt < 0) throw new Error(`${label}: fixed amount must be zero or more`);
    return roundInr(amt);
  }
  const rate = Number(charge.percentRate ?? 0);
  if (!Number.isFinite(rate) || rate < 0) throw new Error(`${label}: percent rate must be zero or more`);
  const base = charge.percentBase === 'BASE_PLOT' || !charge.percentBase ? basePlotPriceInr : basePlotPriceInr;
  return roundInr(base * (rate / 100));
}

export function computeQuotationTotals(input: {
  areaSqft: number;
  pricePerSqftInr: number;
  charges: PlotChargeInput[];
  broker?: {
    kind: 'PERCENTAGE' | 'FIXED';
    rate: number;
    basePlotPriceInr: number;
    paidBy: 'SELLER' | 'BUYER';
    includeInTotal: boolean;
  } | null;
}) {
  const basePlotPriceInr = computeBasePlotPrice(input.areaSqft, input.pricePerSqftInr);
  const chargeLines = input.charges.map((c, i) => ({
    ...c,
    sortOrder: i,
    amountInr: computeChargeAmount(c, basePlotPriceInr),
  }));
  const additionalTotalInr = roundInr(chargeLines.reduce((s, c) => s + c.amountInr, 0));

  let commissionExpectedInr: number | null = null;
  let buyerCommissionInr = 0;
  if (input.broker?.kind && input.broker.rate != null) {
    commissionExpectedInr = commissionExpected(input.broker.kind, input.broker.rate, input.broker.basePlotPriceInr);
    if (input.broker.paidBy === 'BUYER' && input.broker.includeInTotal) buyerCommissionInr = commissionExpectedInr;
  }

  const estimatedTotalInr = roundInr(basePlotPriceInr + additionalTotalInr + buyerCommissionInr);

  return {
    basePlotPriceInr,
    chargeLines,
    additionalTotalInr,
    commissionExpectedInr,
    estimatedTotalInr,
  };
}
