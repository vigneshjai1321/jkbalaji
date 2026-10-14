import type { InvoiceLine } from '@/lib/billing-types';
import type { PreviewInvoiceInput } from '@/lib/billing-preview-session';

/** Fictional demo data — never persisted to the database. */
export function buildSamplePreviewInput(gstApplied = true): PreviewInvoiceInput {
  const lines: InvoiceLine[] = [
    { description: 'Sample gold ring (demo)', hsnSac: gstApplied ? '7113' : undefined, unit: 'pcs', qty: 1, rateInr: 45000, discountInr: 500, gstRatePct: 3 },
    { description: 'Making charges (demo)', hsnSac: gstApplied ? '9988' : undefined, unit: 'job', qty: 1, rateInr: 3500, discountInr: 0, gstRatePct: 3 },
    { description: 'Gift box (demo)', unit: 'nos', qty: 2, rateInr: 150, discountInr: 0, gstRatePct: gstApplied ? 12 : 0 },
  ];
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return {
    sample: true,
    invoiceNo: 'SAMPLE-DEMO-00001',
    invoiceDate: today,
    dueDate: due,
    paymentTerms: 'Sample only — not a real invoice.',
    notes: 'DEMO / SAMPLE — for layout testing only.',
    gstApplied,
    customerSnapshot: {
      name: 'Sample Customer (Demo)',
      phone: '90000 00000',
      email: 'demo.sample@example.com',
      address: 'Sample Address Line, Demo City — 000000',
      gstin: gstApplied ? undefined : undefined,
    },
    lines,
  };
}
