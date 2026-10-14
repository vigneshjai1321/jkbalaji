'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary } from '@/components/admin/AdminForm';
import { InvoicePdfLink } from '@/components/admin/InvoicePdfLink';
import type { BillingSummary, InvoiceListItem, InvoiceStatus } from '@/lib/billing-types';
import { BILLING_SUPPORT_EMAIL, INVOICE_STATUSES } from '@/lib/billing-types';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';

type ListResp = { items: InvoiceListItem[]; total: number; page: number; limit: number };

export default function AdminBillingPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [customerId, setCustomerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [gstFilter, setGstFilter] = useState<'' | 'gst' | 'non-gst'>('');

  const customers = useQuery({
    queryKey: ['billing-customers-list'],
    queryFn: () => adminFetch<Array<{ id: string; name: string; phone: string }>>('/billing/customers'),
  });

  const params = useMemo(() => {
    const q = new URLSearchParams();
    if (search.trim()) q.set('search', search.trim());
    if (status) q.set('status', status);
    if (customerId) q.set('customerId', customerId);
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    if (gstFilter === 'gst') q.set('gstApplied', 'true');
    if (gstFilter === 'non-gst') q.set('gstApplied', 'false');
    q.set('page', String(page));
    q.set('limit', '25');
    return q.toString();
  }, [search, status, customerId, from, to, gstFilter, page]);

  const summary = useQuery({
    queryKey: ['billing-summary'],
    queryFn: () => adminFetch<BillingSummary>('/billing/summary'),
  });

  const invoices = useQuery({
    queryKey: ['billing-invoices', params],
    queryFn: () => adminFetch<ListResp>(`/billing/invoices?${params}`),
  });

  const loading = invoices.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Invoicing, GST reports, and PDF export. Support:{' '}
            <a href={`mailto:${BILLING_SUPPORT_EMAIL}`} className="text-emerald-400 hover:underline">
              {BILLING_SUPPORT_EMAIL}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/billing/gst">
            <AdminBtnSecondary>GST & Tax Reports</AdminBtnSecondary>
          </Link>
          <Link href="/billing/settings">
            <AdminBtnSecondary>Billing settings</AdminBtnSecondary>
          </Link>
          <Link href="/billing/invoices/new">
            <AdminBtnPrimary>Create Invoice</AdminBtnPrimary>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total invoices" value={String(summary.data?.invoiceCount ?? '—')} />
        <Stat label="Total invoiced" value={`₹${(summary.data?.totalInvoiced ?? 0).toLocaleString('en-IN')}`} />
        <Stat label="Outstanding" value={`₹${(summary.data?.outstanding ?? 0).toLocaleString('en-IN')}`} />
        <Stat label="Amount received" value={`₹${(summary.data?.paymentsReceived ?? 0).toLocaleString('en-IN')}`} />
      </div>

      {(summary.data?.recent?.length ?? 0) > 0 ? (
        <AdminPanel title="Recent invoices">
          <AdminTable
            headers={['Invoice #', 'Customer', 'Date', 'Status', 'Total', '']}
            rows={(summary.data?.recent ?? []).map((inv) => [
              inv.invoiceNo,
              inv.customer.name,
              new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
              inv.status.replace(/_/g, ' '),
              `₹${Number(inv.totalInr).toLocaleString('en-IN')}`,
              <Link key={inv.id} href={`/billing/invoices/${inv.id}`} className="text-emerald-400 text-xs hover:underline">
                View
              </Link>,
            ])}
          />
        </AdminPanel>
      ) : null}

      <AdminPanel title="All invoices">
        <div className="p-4 border-b border-white/5 flex flex-col lg:flex-row gap-3">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm"
            placeholder="Search invoice #, customer, phone, or email…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as InvoiceStatus | '');
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm min-w-[10rem]"
            value={customerId}
            onChange={(e) => {
              setCustomerId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All customers</option>
            {(customers.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm"
            value={gstFilter}
            onChange={(e) => {
              setGstFilter(e.target.value as '' | 'gst' | 'non-gst');
              setPage(1);
            }}
          >
            <option value="">GST & non-GST</option>
            <option value="gst">GST invoices only</option>
            <option value="non-gst">Non-GST only</option>
          </select>
          <input
            type="date"
            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            title="From date"
          />
          <input
            type="date"
            className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            title="To date"
          />
        </div>
        {loading ? (
          <div className="p-8 animate-pulse text-sm text-slate-500">Loading invoices…</div>
        ) : (
          <>
            <AdminTable
              headers={['Invoice #', 'Customer', 'Date', 'GST', 'Status', 'Total', 'Paid', 'Actions']}
              rows={(invoices.data?.items ?? []).map((inv) => [
                inv.invoiceNo,
                inv.customer.name,
                new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
                inv.gstApplied === false ? 'No' : 'Yes',
                inv.status.replace(/_/g, ' '),
                `₹${Number(inv.totalInr).toLocaleString('en-IN')}`,
                `₹${Number(inv.amountPaidInr).toLocaleString('en-IN')}`,
                <span key={inv.id} className="flex flex-wrap gap-2">
                  <Link href={`/billing/invoices/${inv.id}`} className="text-emerald-400 text-xs hover:underline">
                    View
                  </Link>
                  {(inv.status === 'DRAFT' || inv.status === 'UNPAID') && Number(inv.amountPaidInr) === 0 ? (
                    <Link href={`/billing/invoices/${inv.id}?edit=1`} className="text-slate-300 text-xs hover:underline">
                      Edit
                    </Link>
                  ) : null}
                  {inv.status !== 'CANCELLED' && inv.status !== 'DRAFT' ? <InvoicePdfLink id={inv.id} /> : null}
                  {inv.status !== 'DRAFT' ? (
                    <Link href={`/billing/invoices/${inv.id}/preview`} className="text-slate-400 text-xs hover:underline">
                      Print
                    </Link>
                  ) : null}
                </span>,
              ])}
            />
            <div className="p-4 flex items-center justify-between text-sm border-t border-white/5">
              <span>
                Page {invoices.data?.page ?? 1} · {invoices.data?.total ?? 0} invoices
              </span>
              <div className="flex gap-2">
                <button type="button" className="px-3 py-1 rounded border border-white/10 disabled:opacity-40" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded border border-white/10 disabled:opacity-40"
                  disabled={(invoices.data?.page ?? 1) * (invoices.data?.limit ?? 25) >= (invoices.data?.total ?? 0)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </AdminPanel>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-xl font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
