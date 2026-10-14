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
