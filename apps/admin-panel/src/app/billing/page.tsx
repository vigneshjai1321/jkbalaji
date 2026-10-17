'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { InvoiceDeleteDialog, InvoiceEditDrawer, InvoiceViewModal } from '@/components/billing/InvoiceManageDialogs';
import {
  billingPageChromeClass,
  useBillingDateClass,
  useBillingFilterBarClass,
  useBillingInputClass,
  useBillingLinkClass,
  useBillingMutedTextClass,
  useBillingSelectClass,
  useBillingStatCardClass,
} from '@/components/billing/billing-theme';
import { useAdminTheme } from '@/components/admin/AdminShell';
import type { BillingSummary, InvoiceListItem } from '@/lib/billing-types';
import { BILLING_SUPPORT_EMAIL } from '@/lib/billing-types';

type ListResp = { items: InvoiceListItem[]; total: number; page: number; limit: number };

export default function AdminBillingPage() {
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState<'' | 'paid' | 'unpaid'>('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceListItem | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [gstFilter, setGstFilter] = useState<'' | 'gst' | 'non-gst'>('');

  const input = useBillingInputClass();
  const select = useBillingSelectClass();
  const dateInput = useBillingDateClass();
  const filterBar = useBillingFilterBarClass();
  const statCard = useBillingStatCardClass();
  const linkClass = useBillingLinkClass();
  const muted = useBillingMutedTextClass();
  const dark = useAdminTheme() === 'dark';

  const customers = useQuery({
    queryKey: ['billing-customers-list'],
    queryFn: () => adminFetch<Array<{ id: string; name: string; phone: string }>>('/billing/customers'),
  });

  const params = useMemo(() => {
    const q = new URLSearchParams();
    if (search.trim()) q.set('search', search.trim());
    if (payment) q.set('payment', payment);
    if (customerId) q.set('customerId', customerId);
    if (from) q.set('from', from);
    if (to) q.set('to', to);
    if (gstFilter === 'gst') q.set('gstApplied', 'true');
    if (gstFilter === 'non-gst') q.set('gstApplied', 'false');
    q.set('page', String(page));
    q.set('limit', String(limit));
    return q.toString();
  }, [search, payment, customerId, from, to, gstFilter, page, limit]);

  const summary = useQuery({
    queryKey: ['billing-summary'],
    queryFn: () => adminFetch<BillingSummary>('/billing/summary'),
  });

  const invoices = useQuery({
    queryKey: ['billing-invoices', params],
    queryFn: () => adminFetch<ListResp>(`/billing/invoices?${params}`),
  });

  const loading = invoices.isLoading;
  const invoiceTotal = invoices.data?.total ?? 0;
  const invoiceColumns: AdminDataTableColumn<InvoiceListItem>[] = [
    {
      id: 'actions',
      header: 'Actions',
      truncate: false,
      defaultWidth: 112,
      minWidth: 104,
      cell: (inv) => {
        const paid = Number(inv.amountPaidInr);
        const canEdit = (inv.status === 'DRAFT' || inv.status === 'UNPAID') && paid === 0;
        return (
          <span className="inline-flex items-center gap-0.5">
            <button type="button" className="rounded p-1 hover:bg-slate-100" title="View invoice" aria-label={`View ${inv.invoiceNo}`} onClick={() => setViewId(inv.id)}>
              <Eye className="h-4 w-4 text-emerald-700" />
            </button>
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-100 disabled:opacity-30"
              title={canEdit ? 'Edit invoice' : 'Edit is available for drafts and unpaid invoices without payments'}
              aria-label={`Edit ${inv.invoiceNo}`}
              disabled={!canEdit}
              onClick={() => setEditId(inv.id)}
            >
              <Pencil className="h-4 w-4 text-sky-700" />
            </button>
            <button type="button" className="rounded p-1 hover:bg-red-50" title="Delete invoice" aria-label={`Delete ${inv.invoiceNo}`} onClick={() => setDeleteTarget(inv)}>
              <Trash2 className="h-4 w-4 text-red-700" />
            </button>
          </span>
        );
      },
    },
    { id: 'invoiceNo', header: 'Invoice #', defaultWidth: 140, cell: (inv) => <span className="font-mono text-xs">{inv.invoiceNo}</span> },
    { id: 'customer', header: 'Customer', defaultWidth: 180, cell: (inv) => <span title={inv.customer.name}>{inv.customer.name}</span> },
    { id: 'date', header: 'Date', defaultWidth: 120, cell: (inv) => new Date(inv.invoiceDate).toLocaleDateString('en-IN') },
    {
      id: 'amount',
      header: 'Amount',
      defaultWidth: 130,
      cell: (inv) => `₹${Number(inv.totalInr).toLocaleString('en-IN')}`,
    },
    {
      id: 'payment',
      header: 'Payment',
      defaultWidth: 110,
      cell: (inv) => {
        const paid = Number(inv.amountPaidInr);
        const total = Number(inv.totalInr);
        if (inv.status === 'CANCELLED') return 'Cancelled';
        return paid > 0 && paid + 0.001 >= total ? 'Paid' : 'Unpaid';
      },
    },
  ];

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
        <Stat label="Balance due" value={`₹${(summary.data?.outstanding ?? 0).toLocaleString('en-IN')}`} className={statCard} muted={muted} />
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
              <button key={inv.id} type="button" className={clsx(linkClass, 'text-xs')} onClick={() => setViewId(inv.id)}>
                View
              </button>,
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
            <span className={clsx('text-xs font-medium', muted)}>Payment</span>
            <select
              className={select}
              value={payment}
              onChange={(e) => {
                setPayment(e.target.value as '' | 'paid' | 'unpaid');
                setPage(1);
              }}
            >
              <option value="">All</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
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
        <AdminDataTable
          columns={invoiceColumns}
          rows={invoices.data?.items ?? []}
          rowKey={(inv) => inv.id}
          isLoading={loading}
          error={invoices.isError ? 'Could not load invoices.' : null}
          emptyMessage="No invoices match these filters."
          columnLayout={{ tableId: 'invoices', pinnedOrder: ['actions'], requiredVisible: ['actions', 'invoiceNo'] }}
          pagination={{
            page,
            pageSize: limit,
            total: invoiceTotal,
            totalPages: Math.max(1, Math.ceil(invoiceTotal / limit) || 1),
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setLimit(size);
              setPage(1);
            },
          }}
        />
      </AdminPanel>
      {viewId ? <InvoiceViewModal id={viewId} onClose={() => setViewId(null)} /> : null}
      {editId ? <InvoiceEditDrawer id={editId} onClose={() => setEditId(null)} /> : null}
      {deleteTarget ? (
        <InvoiceDeleteDialog
          id={deleteTarget.id}
          invoiceNo={deleteTarget.invoiceNo}
          status={deleteTarget.status}
          hasPayments={Number(deleteTarget.amountPaidInr) > 0}
          onClose={() => setDeleteTarget(null)}
        />
      ) : null}
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
