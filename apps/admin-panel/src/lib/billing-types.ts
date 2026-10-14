export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export type InvoiceLine = {
  description: string;
  hsnSac?: string;
  unit?: string;
  qty: number;
  rateInr: number;
  discountInr?: number;
  gstRatePct?: number;
};

export type InvoiceListItem = {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate?: string | null;
  totalInr: string;
  amountPaidInr: string;
  gstApplied?: boolean;
  customer: { id: string; name: string; phone: string };
};

export type BillingSummary = {
  invoiceCount: number;
  totalInvoiced: number;
  paymentsReceived: number;
  outstanding: number;
  recent?: InvoiceListItem[];
};

export type SellerProfile = {
  tradeName: string;
  legalName: string;
  address: string;
  gstin: string;
  phone: string;
  email: string;
  stateCode: string;
  paymentTermsDefault: string;
  bankDetails: string;
  logoUrl: string;
  invoicePrefix: string;
  defaultApplyGst: boolean;
  authorizedTaxRates: number[];
  invoiceFooter: string;
  billingContactEmail: string;
};

export type GstReport = {
  range: { from: string; to: string; label: string };
  disclaimer: string;
  totals: {
    cgstInr: number;
    sgstInr: number;
    igstInr: number;
    gstCollectedInr: number;
    taxableSalesInr: number;
    invoiceValueInr: number;
    gstInvoiceCount: number;
    nonGstInvoiceCount: number;
  };
  statusBreakdown: { draft: number; issued: number; cancelled: number; paid: number };
  invoices: Array<{
    invoiceNo: string;
    invoiceDate: string;
    customerName: string;
    gstApplied: boolean;
    taxableInr: number;
    cgstInr: number;
    sgstInr: number;
    igstInr: number;
    totalInr: number;
    taxRatePct: number;
    status: string;
  }>;
  monthly: Array<{ label: string; gst: number; total: number; count: number }>;
  quarterly: Array<{ label: string; gst: number; total: number; count: number }>;
};

export const INVOICE_STATUSES: InvoiceStatus[] = ['DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'];

export const BILLING_SUPPORT_EMAIL = 'tmlcheyyar@gmail.com';
