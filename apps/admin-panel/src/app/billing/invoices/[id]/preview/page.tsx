'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';
import { InvoicePrintShell } from '@/components/billing/InvoicePrintShell';
import type { SellerProfile } from '@/lib/billing-types';
import { InvoicePdfLink } from '@/components/admin/InvoicePdfLink';

export default function InvoicePreviewPage() {
  const { id } = useParams<{ id: string }>();

  const seller = useQuery({
    queryKey: ['billing-seller'],
    queryFn: () => adminFetch<SellerProfile>('/billing/seller'),
  });

  const inv = useQuery({
    queryKey: ['billing-invoice', id],
    queryFn: () =>
      adminFetch<{
        invoiceNo: string;
        status: string;
        invoiceDate: string;
        dueDate?: string | null;
        paymentTerms?: string | null;
        notes?: string | null;
        subtotalInr: string;
        discountInr: string;
        cgstInr: string;
        sgstInr: string;
        igstInr: string;
        totalInr: string;
        amountPaidInr: string;
        gstApplied?: boolean;
        customer: { name: string; phone: string; email?: string | null; address?: string | null; gstin?: string | null };
        lines: Array<{
          description: string;
          hsnSac?: string | null;
          unit?: string | null;
          qty: string;
          rateInr: string;
          taxableInr: string;
          cgstInr: string;
          sgstInr: string;
          igstInr: string;
          amountInr: string;
        }>;
      }>(`/billing/invoices/${id}`),
  });

  if (inv.isLoading || seller.isLoading) return <p className="p-8">Loading preview…</p>;
  if (!inv.data || !seller.data) return <p className="p-8 text-red-400">Unable to load invoice</p>;

  return (
    <InvoicePrintShell
      toolbar={
        <>
          <Link href={`/billing/invoices/${id}`}>
            <AdminBtnSecondary type="button">← Back</AdminBtnSecondary>
          </Link>
          {inv.data.status !== 'DRAFT' ? <InvoicePdfLink id={id} /> : null}
        </>
      }
      seller={seller.data}
      invoiceNo={inv.data.invoiceNo}
      status={inv.data.status}
      gstApplied={inv.data.gstApplied !== false}
      invoiceDate={inv.data.invoiceDate}
      dueDate={inv.data.dueDate}
      customer={inv.data.customer}
      lines={inv.data.lines}
      subtotalInr={inv.data.subtotalInr}
      discountInr={inv.data.discountInr}
      cgstInr={inv.data.cgstInr}
      sgstInr={inv.data.sgstInr}
      igstInr={inv.data.igstInr}
      totalInr={inv.data.totalInr}
      amountPaidInr={inv.data.amountPaidInr}
      paymentTerms={inv.data.paymentTerms}
      notes={inv.data.notes}
    />
  );
}
