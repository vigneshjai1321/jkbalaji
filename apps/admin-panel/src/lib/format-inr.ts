export function formatInr(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
}

export function formatRate(kind: string, rate: number | string): string {
  const n = Number(rate);
  if (kind === 'FIXED') return formatInr(n);
  return `${n}%`;
}
