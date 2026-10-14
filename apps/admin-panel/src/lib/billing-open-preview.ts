import { adminFetch } from '@/lib/admin-api';
import type { SellerProfile } from '@/lib/billing-types';
import type { BillingCustomer } from '@/components/billing/CustomerPicker';
import {
  createPreviewSessionId,
  previewDraftUrl,
  writeBillingPreviewPending,
  writeBillingPreviewSession,
  type BillingPreviewSession,
  type PreviewInvoiceInput,
} from '@/lib/billing-preview-session';

type PreviewResp = BillingPreviewSession['preview'];

export type OpenPreviewResult =
  | { ok: true; previewId: string }
  | { ok: false; blocked: true; previewUrl: string; previewId: string };

export async function openInvoicePreviewInNewTab(opts: {
  previewInput: PreviewInvoiceInput;
  seller: SellerProfile;
  customer: BillingCustomer | NonNullable<PreviewInvoiceInput['customerSnapshot']>;
  invoiceDate: string;
  dueDate?: string;
  paymentTerms?: string;
  notes?: string;
  gstApplied: boolean;
  sample?: boolean;
  returnPath: string;
  invoiceNo?: string;
}): Promise<OpenPreviewResult> {
  const previewId = createPreviewSessionId();
  const previewUrl = previewDraftUrl(previewId);

  writeBillingPreviewPending(previewId);
  const tab = window.open(previewUrl, '_blank', 'noopener,noreferrer');
  if (!tab) {
    return { ok: false, blocked: true, previewUrl, previewId };
  }

  const preview = await adminFetch<PreviewResp>('/billing/invoices/preview', {
    method: 'POST',
    body: JSON.stringify({
      ...opts.previewInput,
      invoiceNo: opts.invoiceNo ?? opts.previewInput.invoiceNo,
    }),
  });

  const session: BillingPreviewSession = {
    createdAt: Date.now(),
    sample: opts.sample === true,
    returnPath: opts.returnPath,
    invoiceNo: opts.invoiceNo ?? opts.previewInput.invoiceNo ?? (opts.sample ? 'SAMPLE-DEMO-00001' : 'PREVIEW'),
    invoiceDate: opts.invoiceDate,
    dueDate: opts.dueDate,
    paymentTerms: opts.paymentTerms,
    notes: opts.notes,
    gstApplied: opts.gstApplied,
    seller: opts.seller,
    customer: opts.customer,
    previewPayload: {
      ...opts.previewInput,
      invoiceNo: opts.invoiceNo ?? opts.previewInput.invoiceNo,
    },
    preview,
  };

  writeBillingPreviewSession(session, previewId);
  return { ok: true, previewId };
}
