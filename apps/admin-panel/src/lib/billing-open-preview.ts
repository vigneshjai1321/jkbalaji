import { adminFetch } from '@/lib/admin-api';
import type { SellerProfile } from '@/lib/billing-types';
import type { BillingCustomer } from '@/components/billing/CustomerPicker';
import {
  writeBillingPreviewSession,
  type BillingPreviewSession,
  type PreviewInvoiceInput,
} from '@/lib/billing-preview-session';

type PreviewResp = BillingPreviewSession['preview'];

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
}) {
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

  const previewId = writeBillingPreviewSession(session);
  const url = `/billing/invoices/preview/draft?id=${encodeURIComponent(previewId)}`;
  const tab = window.open(url, '_blank', 'noopener,noreferrer');
  if (!tab) {
    throw new Error('Pop-up blocked. Allow pop-ups for this admin site, then try Preview invoice again.');
  }
}
