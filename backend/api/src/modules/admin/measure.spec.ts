import { describe, expect, it } from 'vitest';
import { commissionExpected, commissionStatus, toSqft } from './measure.js';

describe('area and commission math', () => {
  it('converts land units to square feet without mixing built-up area', () => {
    expect(toSqft(1, 'SQYD')).toBe(9);
    expect(toSqft(1, 'CENT')).toBe(435.6);
    expect(toSqft(1, 'ACRE')).toBe(43560);
  });

  it('keeps expected commission separate from money received', () => {
    expect(commissionExpected('PERCENTAGE', 2, 1_800_000)).toBe(36_000);
    expect(commissionExpected('PERCENTAGE', 2, 500000)).toBe(10000);
    expect(commissionExpected('FIXED', 15000, null)).toBe(15000);
    expect(commissionStatus(10000, 0)).toBe('PENDING');
    expect(commissionStatus(10000, 4000)).toBe('PARTIAL');
    expect(commissionStatus(10000, 10000)).toBe('PAID');
  });
});
