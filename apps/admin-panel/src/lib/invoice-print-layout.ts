export type InvoicePrintLayout = 'compact' | 'full';

/** Compact half-page bill for short invoices; full A4 when content is longer. */
export function suggestInvoicePrintLayout(lineCount: number, notes?: string | null): InvoicePrintLayout {
  if (lineCount > 8) return 'full';
  if (notes && notes.trim().length > 140) return 'full';
  return 'compact';
}
