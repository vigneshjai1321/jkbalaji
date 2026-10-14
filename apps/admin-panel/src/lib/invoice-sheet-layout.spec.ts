import { describe, expect, it } from 'vitest';
import { suggestInvoiceSheetLayout } from './invoice-sheet-layout';

describe('suggestInvoiceSheetLayout', () => {
  it('uses compact for short bills', () => {
    expect(suggestInvoiceSheetLayout(3)).toBe('compact');
  });

  it('uses full for long line lists', () => {
    expect(suggestInvoiceSheetLayout(12)).toBe('full');
  });
});
