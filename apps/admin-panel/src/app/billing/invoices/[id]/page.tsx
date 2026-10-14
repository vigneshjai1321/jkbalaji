'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, AdminBtnSecondary, useAdminInputClass } from '@/components/admin/AdminForm';
import { InvoiceForm } from '@/components/billing/InvoiceForm';
import { InvoicePdfLink } from '@/components/admin/InvoicePdfLink';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Inv = {
  id: string;
  invoiceNo: string;
  status: string;
  invoiceDate: string;
  dueDate?: string | null;
  paymentTerms?: string | null;
  notes?: string | null;
  customerId: string;
  gstApplied?: boolean;
  totalInr: string;
  amountPaidInr: string;
  lines: Array<{
    description: string;
    hsnSac?: string | null;
    qty: string;
    rateInr: string;
    discountInr: string;
    gstRatePct: string;
  }>;
  payments: Array<{ id: string; amountInr: string; paidAt: string; method?: string | null }>;
  events: Array<{ action: string; detail?: string | null; createdAt: string }>;
};

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const router = useRouter();
  const input = useAdminInputClass();
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Cash');
  const [cancelReason, setCancelReason] = useState('');
  const [editing, setEditing] = useState(searchParams.get('edit') === '1');

  const inv = useQuery({
    queryKey: ['billing-invoice', id],
    queryFn: () => adminFetch<Inv>(`/billing/invoices/${id}`),
  });

  const issueMut = useMutation({
    mutationFn: () => adminFetch(`/billing/invoices/${id}/issue`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billing-invoice', id] }),
  });

  const payMut = useMutation({
    mutationFn: () =>
      adminFetch(`/billing/invoices/${id}/payments`, {
        method: 'POST',
        body: JSON.stringify({ amountInr: Number(payAmount), method: payMethod }),
      }),
    onSuccess: () => {
      setPayAmount('');
      qc.invalidateQueries({ queryKey: ['billing-invoice', id] });
      qc.invalidateQueries({ queryKey: ['billing-summary'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: () => adminFetch(`/billing/invoices/${id}`, { method: 'DELETE' }),
    onSuccess: () => router.push('/billing'),
  });

  const cancelMut = useMutation({
    mutationFn: () =>
      adminFetch(`/billing/invoices/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason: cancelReason }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['billing-invoice', id] }),
  });

  const data = inv.data;
  if (inv.isLoading) return <p className="p-8 text-sm text-slate-500">Loading invoice…</p>;
  if (!data) return <p className="p-8 text-sm text-red-400">Invoice not found</p>;

  const canEdit = data.status === 'DRAFT' || data.status === 'UNPAID';
  const balance = Math.max(0, Number(data.totalInr) - Number(data.amountPaidInr));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/billing" className="text-sm text-emerald-400 hover:underline">
          ← Billing
        </Link>
        <h1 className="text-xl font-bold">{data.invoiceNo}</h1>
        <span className="text-xs uppercase tracking-wide px-2 py-1 rounded bg-white/10">{data.status.replace(/_/g, ' ')}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/billing/invoices/${id}/preview`}>
          <AdminBtnSecondary type="button">Preview / Print</AdminBtnSecondary>
        </Link>
        {data.status !== 'DRAFT' && data.status !== 'CANCELLED' ? <InvoicePdfLink id={id} /> : null}
        {data.status === 'DRAFT' ? (
          <AdminBtnPrimary type="button" onClick={() => issueMut.mutate()} disabled={issueMut.isPending}>
            Issue Invoice
          </AdminBtnPrimary>
        ) : null}
        {canEdit && Number(data.amountPaidInr) === 0 ? (
          <AdminBtnSecondary type="button" onClick={() => setEditing((e) => !e)}>
            {editing ? 'Cancel edit' : 'Edit'}
          </AdminBtnSecondary>
        ) : null}
        {data.status === 'DRAFT' ? (
          <AdminBtnSecondary
            type="button"
            className="!border-red-500/40 !text-red-300"
            disabled={deleteMut.isPending}
            onClick={() => {
              if (confirm('Delete this draft permanently?')) deleteMut.mutate();
            }}
          >
            Delete draft
          </AdminBtnSecondary>
        ) : null}
      </div>

      {editing && canEdit ? (
        <AdminPanel title="Edit invoice">
          <div className="p-4 md:p-6">
            <InvoiceForm
              mode="edit"
              invoiceId={id}
              invoiceNo={data.invoiceNo}
              initialAmountPaid={Number(data.amountPaidInr)}
              initialStatus={data.status}
              initial={{
                customerId: data.customerId,
                invoiceDate: data.invoiceDate.slice(0, 10),
                dueDate: data.dueDate?.slice(0, 10),
                paymentTerms: data.paymentTerms ?? undefined,
                notes: data.notes ?? undefined,
                gstApplied: data.gstApplied !== false,
                lines: data.lines.map((l) => ({
                  description: l.description,
                  hsnSac: l.hsnSac ?? undefined,
                  unit: (l as { unit?: string }).unit ?? 'nos',
                  qty: Number(l.qty),
                  rateInr: Number(l.rateInr),
                  discountInr: Number(l.discountInr),
                  gstRatePct: Number(l.gstRatePct),
                })),
              }}
              onSaved={() => {
                setEditing(false);
                qc.invalidateQueries({ queryKey: ['billing-invoice', id] });
              }}
            />
          </div>
        </AdminPanel>
      ) : (
        <AdminPanel title="Summary">
          <dl className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Total</dt>
              <dd className="text-lg font-bold tabular-nums">₹{Number(data.totalInr).toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Paid</dt>
              <dd className="text-lg font-bold tabular-nums">₹{Number(data.amountPaidInr).toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Balance due</dt>
              <dd className="text-lg font-bold tabular-nums">₹{balance.toLocaleString('en-IN')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Date</dt>
              <dd>{new Date(data.invoiceDate).toLocaleDateString('en-IN')}</dd>
            </div>
          </dl>
        </AdminPanel>
      )}

      {data.payments.length > 0 ? (
        <AdminPanel title="Payment history">
          <ul className="p-4 space-y-2 text-sm">
            {data.payments.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-white/5 pb-2">
                <span>
                  ₹{Number(p.amountInr).toLocaleString('en-IN')} · {p.method ?? '—'}
                </span>
                <span className="text-slate-500">{new Date(p.paidAt).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}

      {data.status !== 'DRAFT' && data.status !== 'CANCELLED' && balance > 0 ? (
        <AdminPanel title="Record payment">
          <form
            className="p-4 flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (payAmount) payMut.mutate();
            }}
          >
            <input type="number" className={input} placeholder="Amount ₹" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
            <select className={input} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              <option>Cash</option>
              <option>UPI</option>
              <option>Bank transfer</option>
              <option>Card</option>
            </select>
            <AdminBtnPrimary type="submit" disabled={payMut.isPending}>
              Record payment
            </AdminBtnPrimary>
          </form>
        </AdminPanel>
      ) : null}

      {data.status !== 'CANCELLED' ? (
        <AdminPanel title="Cancel invoice">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <input className={input} placeholder="Reason for cancellation" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <AdminBtnSecondary
              type="button"
              className="!border-red-500/50 !text-red-300"
              disabled={!cancelReason.trim() || cancelMut.isPending}
              onClick={() => {
                if (confirm('Cancel this invoice? This cannot be undone.')) cancelMut.mutate();
              }}
            >
              Cancel invoice
            </AdminBtnSecondary>
          </div>
        </AdminPanel>
      ) : null}

      <AdminPanel title="Audit history">
        <ul className="p-4 space-y-2 text-sm">
          {data.events.map((ev) => (
            <li key={ev.createdAt + ev.action} className="border-b border-white/5 pb-2">
              <span className="font-medium">{ev.action}</span>
              {ev.detail ? ` — ${ev.detail}` : ''}
              <span className="text-slate-500 ml-2">{new Date(ev.createdAt).toLocaleString('en-IN')}</span>
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
