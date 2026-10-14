import { describe, expect, it } from 'vitest';
import { computeBasePlotPrice, computeQuotationTotals } from './plot-calculations.js';

describe('plot-calculations', () => {
  it('computes base plot price', () => {
    expect(computeBasePlotPrice(1200, 1500)).toBe(1800000);
  });

  it('totals additional costs and optional buyer commission', () => {
    const t = computeQuotationTotals({
      areaSqft: 1200,
      pricePerSqftInr: 1500,
      charges: [
        { label: 'Registration', kind: 'FIXED', fixedAmountInr: 50000 },
        { label: 'Stamp duty', kind: 'PERCENT', percentRate: 2, percentBase: 'BASE_PLOT' },
      ],
      broker: {
        kind: 'PERCENTAGE',
        rate: 1,
        basePlotPriceInr: 1800000,
        paidBy: 'BUYER',
        includeInTotal: true,
      },
    });
    expect(t.basePlotPriceInr).toBe(1800000);
    expect(t.additionalTotalInr).toBe(86000);
    expect(t.commissionExpectedInr).toBe(18000);
    expect(t.estimatedTotalInr).toBe(1800000 + 86000 + 18000);
  });
});
