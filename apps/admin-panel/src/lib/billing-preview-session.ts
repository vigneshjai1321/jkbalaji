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

type PendingMarker = { pending: true; createdAt: number };

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

export function createPreviewSessionId(): string {
  return crypto.randomUUID();
}

export function previewDraftUrl(previewId: string): string {
  if (typeof window === 'undefined') {
    return `/billing/invoices/preview/draft?id=${encodeURIComponent(previewId)}`;
  }
  return `${window.location.origin}/billing/invoices/preview/draft?id=${encodeURIComponent(previewId)}`;
}

/** Reserve an id before async work so a new tab can open synchronously from the click handler. */
export function writeBillingPreviewPending(previewId: string) {
  const marker: PendingMarker = { pending: true, createdAt: Date.now() };
  localStorage.setItem(storageKey(previewId), JSON.stringify(marker));
}

export function writeBillingPreviewSession(data: BillingPreviewSession, previewId?: string): string {
  const id = previewId ?? createPreviewSessionId();
  localStorage.setItem(storageKey(id), JSON.stringify(data));
  return id;
}

function parseSession(raw: string): BillingPreviewSession | null {
  try {
    const parsed = JSON.parse(raw) as BillingPreviewSession & Partial<PendingMarker>;
    if ('pending' in parsed && parsed.pending) return null;
    if (Date.now() - parsed.createdAt > 1000 * 60 * 60 * 2) return null;
    return parsed as BillingPreviewSession;
  } catch {
    return null;
  }
}

export function readBillingPreviewSession(previewId?: string | null): BillingPreviewSession | null {
  if (typeof window === 'undefined') return null;
  const id = previewId || localStorage.getItem(`${BILLING_PREVIEW_SESSION_KEY}:latest`);
  if (!id) return null;
  const raw = localStorage.getItem(storageKey(id));
  if (!raw) return null;
  return parseSession(raw);
}

export function isPreviewSessionPending(previewId: string): boolean {
  const raw = localStorage.getItem(storageKey(previewId));
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as PendingMarker;
    return parsed.pending === true;
  } catch {
    return false;
  }
}

/** Poll until session is written or timeout (new tab opened before async preview completes). */
export function waitForBillingPreviewSession(
  previewId: string,
  opts?: { timeoutMs?: number; intervalMs?: number },
): Promise<BillingPreviewSession | null> {
  const timeoutMs = opts?.timeoutMs ?? 45_000;
  const intervalMs = opts?.intervalMs ?? 150;
  const started = Date.now();

  return new Promise((resolve) => {
    const tick = () => {
      const data = readBillingPreviewSession(previewId);
      if (data) {
        resolve(data);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        resolve(null);
        return;
      }
      window.setTimeout(tick, intervalMs);
    };
    tick();
  });
}

export function clearBillingPreviewSession(previewId?: string) {
  if (previewId) localStorage.removeItem(storageKey(previewId));
}
