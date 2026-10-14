export type InvoiceSheetLayout = 'compact' | 'full';

/** Compact = bill content in upper half of A4 frame; full = multi-page friendly. */
export function suggestInvoiceSheetLayout(lineCount: number, notes?: string | null): InvoiceSheetLayout {
  if (lineCount > 8) return 'full';
  if (notes && notes.trim().length > 140) return 'full';
  return 'compact';
}
