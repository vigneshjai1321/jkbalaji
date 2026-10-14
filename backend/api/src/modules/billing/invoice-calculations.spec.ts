import { describe, expect, it } from 'vitest';
import { computeLines, paymentStatus, resolveTaxMode } from './invoice-calculations.js';

describe('resolveTaxMode', () => {
  it('uses IGST for inter-state', () => {
    expect(resolveTaxMode('33', '29')).toBe('IGST');
  });
  it('uses CGST/SGST for same state', () => {
    expect(resolveTaxMode('33', '33')).toBe('CGST_SGST');
  });
});

describe('computeLines', () => {
  it('splits GST for intra-state', () => {
    const { totals, lines } = computeLines(
      [{ description: 'Ring', qty: 1, rateInr: 10000, gstRatePct: 3 }],
      'CGST_SGST',
    );
    expect(lines[0]!.taxableInr).toBe(10000);
    expect(totals.cgstInr + totals.sgstInr).toBeCloseTo(300, 0);
    expect(totals.totalInr).toBeCloseTo(10300, 0);
  });

  it('skips tax when GST disabled', () => {
    const { totals } = computeLines(
      [{ description: 'Item', qty: 1, rateInr: 5000, gstRatePct: 18 }],
      'CGST_SGST',
      false,
    );
    expect(totals.cgstInr).toBe(0);
    expect(totals.totalInr).toBe(5000);
  });
});

describe('paymentStatus', () => {
  it('detects partial payment', () => {
    expect(paymentStatus(1000, 400)).toBe('PARTIALLY_PAID');
    expect(paymentStatus(1000, 1000)).toBe('PAID');
  });
});
