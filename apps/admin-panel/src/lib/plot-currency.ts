export function formatInr(value: number | string | null | undefined, fallback = '—') {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatSqft(value: number | string | null | undefined) {
  if (value == null || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function computeBaseFromRate(areaSqft: number, rate: number) {
  if (!Number.isFinite(areaSqft) || areaSqft <= 0 || !Number.isFinite(rate)) return null;
  return Math.round(areaSqft * rate * 100) / 100;
}

/** Read-only estimate for plot forms — not a commission ledger entry. */
export function estimateCommissionInr(
  kind: 'PERCENTAGE' | 'FIXED' | string,
  rate: number,
  basePlotPriceInr: number | null,
): number | null {
  if (!Number.isFinite(rate) || rate < 0) return null;
  if (kind === 'FIXED') return Math.round(rate * 100) / 100;
  if (basePlotPriceInr == null || !Number.isFinite(basePlotPriceInr) || basePlotPriceInr <= 0) return null;
  return Math.round(basePlotPriceInr * (rate / 100) * 100) / 100;
}
