import { describe, expect, it } from 'vitest';
import { gstinFormatIssue, isGstinFormatValid, normalizeGstin } from './gstin-format.js';

describe('gstin-format', () => {
  it('accepts known shop GSTIN pattern', () => {
    expect(isGstinFormatValid('33AAHCJ1786C1ZQ')).toBe(true);
    expect(gstinFormatIssue('33AAHCJ1786C1ZQ')).toBeNull();
  });

  it('normalizes case', () => {
    expect(normalizeGstin(' 33aahcj1786c1zq ')).toBe('33AAHCJ1786C1ZQ');
  });

  it('flags bad length', () => {
    expect(gstinFormatIssue('33AAHC')).toMatch(/15 characters/);
  });
});
