'use client';

import { useState } from 'react';
import { Printer } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { InvoiceForm } from '@/components/billing/InvoiceForm';
import { InvoiceDocument } from '@/components/billing/InvoiceDocument';
import type { SellerProfile } from '@/lib/billing-types';

type InvoiceDetail = {
  id: string;
  invoiceNo: string;
  status: string;
  invoiceDate: string;
  dueDate?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  customerId: string;
  gstApplied?: boolean;
  subtotalInr: string;
  discountInr: string;
  cgstInr: string;
  sgstInr: string;
  igstInr: string;
  totalInr: string;
  amountPaidInr: string;
  customer: { name: string; phone: string; email?: string | null; address?: string | null; gstin?: string | null };
  lines: Array<{
    description: string;
    hsnSac?: string | null;
    unit?: string | null;
    qty: string;
    rateInr: string;
    discountInr: string;
    gstRatePct: string;
    taxableInr?: string;
    cgstInr?: string;
    sgstInr?: string;
    igstInr?: string;
    amountInr: string;
  }>;
  payments: Array<{ id: string; amountInr: string }>;
};

export function InvoiceViewModal({ id, onClose }: { id: string; onClose: () => void }) {
  const seller = useQuery({
    queryKey: ['billing-seller'],
    queryFn: () => adminFetch<SellerProfile>('/billing/seller'),
  });
  const inv = useQuery({
    queryKey: ['billing-invoice', id],
    queryFn: () => adminFetch<InvoiceDetail>(`/billing/invoices/${id}`),
  });

  return (
    <div className="invoice-preview-modal billing-print-root fixed inset-0 z-[120] flex items-start justify-center bg-black/50 p-3 sm:p-6 overflow-y-auto print:bg-white">
      <div className="w-full max-w-[210mm] min-w-0">
        <div className="no-print mb-3 flex flex-wrap items-center gap-2">
          <AdminBtnSecondary type="button" onClick={onClose}>
            Close
          </AdminBtnSecondary>
          <AdminBtnPrimary type="button" onClick={() => window.print()} className="!py-1.5 !px-3 !text-xs gap-1.5">
            <Printer className="h-4 w-4" aria-hidden />
            Print
          </AdminBtnPrimary>
        </div>
        {inv.isLoading || seller.isLoading ? (
          <p className="no-print rounded-lg bg-white p-6 text-sm text-slate-600">Loading invoice…</p>
        ) : inv.isError || !inv.data || !seller.data ? (
          <p className="no-print rounded-lg bg-white p-6 text-sm text-red-700">Unable to load this invoice.</p>
        ) : (
          <InvoiceDocument
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
        )}
      </div>
    </div>
  );
}

export function InvoiceEditDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const inv = useQuery({
    queryKey: ['billing-invoice', id],
    queryFn: () => adminFetch<InvoiceDetail>(`/billing/invoices/${id}`),
  });
  const canEdit = inv.data && (inv.data.status === 'DRAFT' || inv.data.status === 'UNPAID') && Number(inv.data.amountPaidInr) === 0;

  return (
    <div className="fixed inset-0 z-[120] flex justify-end bg-black/50">
      <div className="flex h-full w-full max-w-5xl flex-col bg-white shadow-xl min-w-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-base font-semibold text-stone-900">Edit invoice</h2>
          <AdminBtnSecondary type="button" onClick={onClose}>
            Close
          </AdminBtnSecondary>
        </div>
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          {inv.isLoading ? <p className="text-sm text-slate-500">Loading…</p> : null}
          {inv.data && !canEdit ? (
            <p className="text-sm text-amber-900">
              This invoice cannot be edited because it is {inv.data.status.replace(/_/g, ' ').toLowerCase()}
              {Number(inv.data.amountPaidInr) > 0 ? ' and already has payments' : ''}.
            </p>
          ) : null}
          {inv.data && canEdit ? (
            <InvoiceForm
              mode="edit"
              invoiceId={id}
              invoiceNo={inv.data.invoiceNo}
              initialAmountPaid={Number(inv.data.amountPaidInr)}
              initialStatus={inv.data.status}
              initial={{
                customerId: inv.data.customerId,
                invoiceDate: inv.data.invoiceDate.slice(0, 10),
                dueDate: inv.data.dueDate?.slice(0, 10),
                paymentTerms: inv.data.paymentTerms ?? undefined,
                notes: inv.data.notes ?? undefined,
                gstApplied: inv.data.gstApplied !== false,
                lines: inv.data.lines.map((l) => ({
                  description: l.description,
                  hsnSac: l.hsnSac ?? undefined,
                  unit: l.unit ?? 'nos',
                  qty: Number(l.qty),
                  rateInr: Number(l.rateInr),
                  discountInr: Number(l.discountInr),
                  gstRatePct: Number(l.gstRatePct),
                })),
              }}
              onSaved={() => {
                void qc.invalidateQueries({ queryKey: ['billing-invoices'] });
                void qc.invalidateQueries({ queryKey: ['billing-invoice', id] });
                void qc.invalidateQueries({ queryKey: ['billing-summary'] });
                onClose();
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function InvoiceDeleteDialog({
  id,
  invoiceNo,
  status,
  hasPayments,
  onClose,
}: {
  id: string;
  invoiceNo: string;
  status: string;
  hasPayments: boolean;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const canDelete = status === 'DRAFT';

  const remove = useMutation({
    mutationFn: () => adminFetch(`/billing/invoices/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['billing-invoices'] });
      void qc.invalidateQueries({ queryKey: ['billing-summary'] });
      onClose();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  const cancel = useMutation({
    mutationFn: () => adminFetch(`/billing/invoices/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['billing-invoices'] });
      void qc.invalidateQueries({ queryKey: ['billing-summary'] });
      onClose();
    },
    onError: (e: Error) => setMessage(e.message),
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-4 text-sm text-slate-900 shadow-xl">
        <h2 className="text-base font-semibold">Delete invoice {invoiceNo}?</h2>
        {canDelete ? (
          <p className="mt-2 text-slate-600">This draft will be removed. Issued invoices are not deleted.</p>
        ) : (
          <p className="mt-2 text-slate-600">
            {hasPayments
              ? 'This invoice has payment records, so it cannot be deleted. You can cancel it instead. Cancellation keeps the payment history.'
              : 'Issued invoices cannot be deleted. Cancel the invoice if it should no longer be active.'}
          </p>
        )}
        {!canDelete && status !== 'CANCELLED' ? (
          <label className="mt-3 block text-xs">
            Cancel reason
            <input className="mt-1 w-full rounded-lg border px-2 py-1.5" value={reason} onChange={(e) => setReason(e.target.value)} />
          </label>
        ) : null}
        {message ? <p className="mt-2 text-xs text-red-700">{message}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {canDelete ? (
            <button
              type="button"
              className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              disabled={remove.isPending}
              onClick={() => remove.mutate()}
            >
              {remove.isPending ? 'Deleting…' : 'Delete draft'}
            </button>
          ) : status !== 'CANCELLED' ? (
            <button
              type="button"
              className="rounded-lg bg-stone-800 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
              disabled={cancel.isPending || reason.trim().length < 3}
              onClick={() => cancel.mutate()}
            >
              {cancel.isPending ? 'Cancelling…' : 'Cancel invoice'}
            </button>
          ) : null}
          <button type="button" className="rounded-lg border px-3 py-2 text-xs" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
