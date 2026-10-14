import type { InvoiceLine, SellerProfile } from '@/lib/billing-types';
import type { BillingCustomer } from '@/components/billing/CustomerPicker';

export const BILLING_PREVIEW_SESSION_KEY = 'jk_billing_draft_preview_v1';

export type BillingPreviewSession = {
  createdAt: number;
  sample: boolean;
  returnPath: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  gstApplied: boolean;
  seller: SellerProfile;
  customer: BillingCustomer | { name: string; phone: string; email?: string | null; address?: string | null; gstin?: string | null };
  previewPayload: PreviewInvoiceInput;
  preview: {
    taxMode: string;
    gstApplied: boolean;
    lines: Array<
      InvoiceLine & { taxableInr: number; cgstInr: number; sgstInr: number; igstInr: number; amountInr: number }
    >;
    totals: {
      subtotalInr: number;
      discountInr: number;
      cgstInr: number;
      sgstInr: number;
      igstInr: number;
      totalInr: number;
    };
  };
};

/** Mirrors API preview body (client-side). */
export type PreviewInvoiceInput = {
  customerId?: string;
  customerSnapshot?: {
    name: string;
    phone: string;
    email?: string | null;
    address?: string | null;
    gstin?: string | null;
  };
  invoiceDate?: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  lines: InvoiceLine[];
  gstApplied?: boolean;
  invoiceNo?: string;
  sample?: boolean;
};

function storageKey(id: string) {
  return `${BILLING_PREVIEW_SESSION_KEY}:${id}`;
}

/** Persists preview in localStorage so a new tab can read it (sessionStorage is tab-isolated). */
export function writeBillingPreviewSession(data: BillingPreviewSession): string {
  const id = crypto.randomUUID();
  const payload = JSON.stringify(data);
  localStorage.setItem(storageKey(id), payload);
  localStorage.setItem(`${BILLING_PREVIEW_SESSION_KEY}:latest`, id);
  return id;
}

export function readBillingPreviewSession(previewId?: string | null): BillingPreviewSession | null {
  if (typeof window === 'undefined') return null;
  const id = previewId || localStorage.getItem(`${BILLING_PREVIEW_SESSION_KEY}:latest`);
  if (!id) return null;
  const raw = localStorage.getItem(storageKey(id));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BillingPreviewSession;
    if (Date.now() - parsed.createdAt > 1000 * 60 * 60 * 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearBillingPreviewSession(previewId?: string) {
  if (previewId) localStorage.removeItem(storageKey(previewId));
}
