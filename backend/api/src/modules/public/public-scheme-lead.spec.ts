import { describe, expect, it } from 'vitest';

const MIN = 5_000;
const MAX = 100_000;

function validateSchemeAmount(schemeAmountInr: unknown, leadType?: string): string | null {
  if (leadType === 'GOLD_SCHEME_ENQUIRY' && schemeAmountInr == null) {
    return 'Scheme enquiry requires an amount';
  }
  if (schemeAmountInr == null) return null;
  const amt = Number(schemeAmountInr);
  if (!Number.isFinite(amt) || amt < MIN || amt > MAX) {
    return 'out of range';
  }
  return null;
}

describe('gold scheme lead amount validation', () => {
  it('requires amount for scheme enquiries', () => {
    expect(validateSchemeAmount(undefined, 'GOLD_SCHEME_ENQUIRY')).toBeTruthy();
    expect(validateSchemeAmount(10_000, 'GOLD_SCHEME_ENQUIRY')).toBeNull();
  });

  it('rejects out-of-range amounts', () => {
    expect(validateSchemeAmount(4_999, 'GOLD_SCHEME_ENQUIRY')).toBeTruthy();
    expect(validateSchemeAmount(100_001, 'GOLD_SCHEME_ENQUIRY')).toBeTruthy();
  });
});
