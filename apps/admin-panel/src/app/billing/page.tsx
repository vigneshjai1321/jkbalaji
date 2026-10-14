'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { InvoicePdfLink } from '@/components/admin/InvoicePdfLink';
import {
  billingPageChromeClass,
  useBillingDateClass,
  useBillingFilterBarClass,
  useBillingInputClass,
  useBillingLinkClass,
  useBillingMutedTextClass,
  useBillingPagerBtnClass,
  useBillingSelectClass,
  useBillingStatCardClass,
} from '@/components/billing/billing-theme';
import { useAdminTheme } from '@/components/admin/AdminShell';
import type { BillingSummary, InvoiceListItem, InvoiceStatus } from '@/lib/billing-types';
import { BILLING_SUPPORT_EMAIL, INVOICE_STATUSES } from '@/lib/billing-types';

type ListResp = { items: InvoiceListItem[]; total: number; page: number; limit: number };

export default function AdminBillingPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<InvoiceStatus | ''>('');
  const [customerId, setCustomerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [gstFilter, setGstFilter] = useState<'' | 'gst' | 'non-gst'>('');

  const input = useBillingInputClass();
  const select = useBillingSelectClass();
  const dateInput = useBillingDateClass();
  const filterBar = useBillingFilterBarClass();
  const statCard = useBillingStatCardClass();
  const linkClass = useBillingLinkClass();
  const muted = useBillingMutedTextClass();
  const pagerBtn = useBillingPagerBtnClass();
  const dark = useAdminTheme() === 'dark';
  const tableActionMuted = dark ? 'text-slate-300' : 'text-stone-600';
  const tableActionPrint = dark ? 'text-slate-400' : 'text-stone-500';

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
    <div className={billingPageChromeClass()}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-inherit">Billing Dashboard</h1>
          <p className={clsx('text-sm mt-1', muted)}>
            Invoicing, GST reports, and PDF export. Support:{' '}
            <a href={`mailto:${BILLING_SUPPORT_EMAIL}`} className={linkClass}>
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
            <AdminBtnPrimary className={!dark ? '!bg-amber-800 hover:!bg-amber-900' : undefined}>Create Invoice</AdminBtnPrimary>
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total invoices" value={String(summary.data?.invoiceCount ?? '—')} className={statCard} muted={muted} />
        <Stat label="Total invoiced" value={`₹${(summary.data?.totalInvoiced ?? 0).toLocaleString('en-IN')}`} className={statCard} muted={muted} />
        <Stat label="Outstanding" value={`₹${(summary.data?.outstanding ?? 0).toLocaleString('en-IN')}`} className={statCard} muted={muted} />
        <Stat label="Amount received" value={`₹${(summary.data?.paymentsReceived ?? 0).toLocaleString('en-IN')}`} className={statCard} muted={muted} />
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
              <Link key={inv.id} href={`/billing/invoices/${inv.id}`} className={clsx(linkClass, 'text-xs')}>
                View
              </Link>,
            ])}
          />
        </AdminPanel>
      ) : null}

      <AdminPanel title="All invoices">
        <div className={filterBar}>
          <label className="lg:col-span-4 flex flex-col gap-1 min-w-0">
            <span className={clsx('text-xs font-medium', muted)}>Search</span>
            <input
              className={input}
              placeholder="Invoice #, customer, phone, or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="lg:col-span-2 flex flex-col gap-1 min-w-0">
            <span className={clsx('text-xs font-medium', muted)}>Status</span>
            <select
              className={select}
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
          </label>
          <label className="lg:col-span-2 flex flex-col gap-1 min-w-0">
            <span className={clsx('text-xs font-medium', muted)}>Customer</span>
            <select
              className={select}
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
          </label>
          <label className="lg:col-span-2 flex flex-col gap-1 min-w-0">
            <span className={clsx('text-xs font-medium', muted)}>GST</span>
            <select
              className={select}
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
          </label>
          <label className="lg:col-span-1 flex flex-col gap-1 min-w-0">
            <span className={clsx('text-xs font-medium', muted)}>From</span>
            <input
              type="date"
              className={dateInput}
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              title="From date"
            />
          </label>
          <label className="lg:col-span-1 flex flex-col gap-1 min-w-0">
            <span className={clsx('text-xs font-medium', muted)}>To</span>
            <input
              type="date"
              className={dateInput}
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              title="To date"
            />
          </label>
        </div>
        {loading ? (
          <div className={clsx('p-8 animate-pulse text-sm', muted)}>Loading invoices…</div>
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
                  <Link href={`/billing/invoices/${inv.id}`} className={clsx(linkClass, 'text-xs')}>
                    View
                  </Link>
                  {(inv.status === 'DRAFT' || inv.status === 'UNPAID') && Number(inv.amountPaidInr) === 0 ? (
                    <Link href={`/billing/invoices/${inv.id}?edit=1`} className={clsx(tableActionMuted, 'text-xs hover:underline')}>
                      Edit
                    </Link>
                  ) : null}
                  {inv.status !== 'CANCELLED' && inv.status !== 'DRAFT' ? <InvoicePdfLink id={inv.id} /> : null}
                  {inv.status !== 'DRAFT' ? (
                    <Link href={`/billing/invoices/${inv.id}/preview`} className={clsx(tableActionPrint, 'text-xs hover:underline')}>
                      Print
                    </Link>
                  ) : null}
                </span>,
              ])}
            />
            <div
              className={clsx(
                'p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm border-t',
                dark ? 'border-white/5' : 'border-stone-200/80',
              )}
            >
              <span className={muted}>
                Page {invoices.data?.page ?? 1} · {invoices.data?.total ?? 0} invoices
              </span>
              <div className="flex gap-2">
                <button type="button" className={pagerBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <button
                  type="button"
                  className={pagerBtn}
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

function Stat({ label, value, className, muted }: { label: string; value: string; className: string; muted: string }) {
  return (
    <div className={className}>
      <p className={clsx('text-xs uppercase tracking-wide', muted)}>{label}</p>
      <p className="text-xl font-bold mt-1 tabular-nums text-stone-900 dark:text-inherit">{value}</p>
    </div>
  );
}
