export const AREA_TO_SQFT = {
  SQFT: 1,
  SQYD: 9,
  SQM: 10.76391041671,
  ACRE: 43560,
  CENT: 435.6,
} as const;

export type AreaUnitCode = keyof typeof AREA_TO_SQFT;

export function toSqft(value: number, unit: AreaUnitCode): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('Area must be a non-negative number');
  }
  return Math.round(value * AREA_TO_SQFT[unit] * 100) / 100;
}

export function commissionExpected(kind: 'PERCENTAGE' | 'FIXED', rate: number, saleValue: number | null): number {
  if (!Number.isFinite(rate) || rate < 0) throw new Error('Commission rate must be a non-negative number');
  if (kind === 'FIXED') return Math.round(rate * 100) / 100;
  if (saleValue == null || !Number.isFinite(saleValue) || saleValue < 0) {
    throw new Error('A sale value is required for a percentage commission');
  }
  return Math.round(saleValue * (rate / 100) * 100) / 100;
}

export function commissionStatus(expected: number, paid: number): 'PENDING' | 'PARTIAL' | 'PAID' {
  if (paid <= 0) return 'PENDING';
  if (paid + 0.001 >= expected) return 'PAID';
  return 'PARTIAL';
}
