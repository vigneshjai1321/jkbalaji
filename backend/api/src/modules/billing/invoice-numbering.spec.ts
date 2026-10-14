import { describe, expect, it } from 'vitest';
import { formatInvoiceNo, parseInvoiceNo, assertInvoiceNoFormat, isLegacyDraftNo } from './invoice-numbering.js';

describe('invoice-numbering', () => {
  it('formats SBT-INV series', () => {
    expect(formatInvoiceNo('SBT-INV', 2026, 1)).toBe('SBT-INV-2026-0001');
    expect(formatInvoiceNo('SBT-INV', 2026, 42)).toBe('SBT-INV-2026-0042');
  });

  it('parses valid numbers', () => {
    const p = parseInvoiceNo('SBT-INV-2026-0003', 'SBT-INV');
    expect(p?.seq).toBe(3);
    expect(p?.year).toBe(2026);
  });

  it('rejects invalid numbers', () => {
    expect(parseInvoiceNo('INV-2026-1', 'SBT-INV')).toBeNull();
    expect(() => assertInvoiceNoFormat('BAD', 'SBT-INV')).toThrow();
  });

  it('detects legacy draft ids', () => {
    expect(isLegacyDraftNo('DRAFT-ABC123')).toBe(true);
    expect(isLegacyDraftNo('SBT-INV-2026-0001')).toBe(false);
  });
});
