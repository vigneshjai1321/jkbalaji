'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAuthHeaders, adminFetch, adminApiBase } from '@/lib/admin-api';
import { clsx } from 'clsx';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';
import {
  billingPageChromeClass,
  useBillingDateClass,
  useBillingLinkClass,
  useBillingMutedTextClass,
  useBillingSelectClass,
  useBillingStatCardClass,
} from '@/components/billing/billing-theme';
import { useAdminTheme } from '@/components/admin/AdminShell';
import type { GstReport } from '@/lib/billing-types';

export default function GstReportsPage() {
  const [preset, setPreset] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const select = useBillingSelectClass();
  const dateInput = useBillingDateClass();
  const linkClass = useBillingLinkClass();
  const muted = useBillingMutedTextClass();
  const statCard = useBillingStatCardClass();
  const dark = useAdminTheme() === 'dark';

  const params = useMemo(() => {
    const q = new URLSearchParams();
    if (preset === 'custom' && from && to) {
      q.set('from', from);
      q.set('to', to);
    } else if (preset !== 'custom') {
      q.set('preset', preset);
    }
    return q.toString();
  }, [preset, from, to]);

  const report = useQuery({
    queryKey: ['billing-gst-report', params],
    queryFn: () => adminFetch<GstReport>(`/billing/reports/gst?${params}`),
    enabled: preset !== 'custom' || Boolean(from && to),
  });

  const t = report.data?.totals;

  function download(kind: 'csv' | 'pdf') {
    const url = `${adminApiBase()}/admin/billing/reports/gst/export.${kind}?${params}`;
    fetch(url, { headers: adminAuthHeaders() })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = kind === 'csv' ? 'gst-report.csv' : 'gst-report.pdf';
        a.click();
      });
  }

  return (
    <div className={billingPageChromeClass()}>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/billing" className={clsx('text-sm', linkClass)}>
          ← Billing
        </Link>
        <h1 className="text-xl font-bold text-stone-900 dark:text-inherit">GST & Tax Reports</h1>
      </div>
      <p className={clsx('text-sm max-w-3xl', dark ? 'text-amber-200/80' : 'text-amber-900/80')}>
        {report.data?.disclaimer ?? 'Internal summaries from issued invoices only.'}
      </p>

      <AdminPanel title="Period">
        <div className="p-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
          <label className="flex flex-col gap-1 min-w-[12rem] flex-1 sm:flex-none">
            <span className={clsx('text-xs font-medium', muted)}>Report period</span>
            <select className={select} value={preset} onChange={(e) => setPreset(e.target.value)}>
            <option value="today">Today</option>
            <option value="month">This month</option>
            <option value="prev_month">Previous month</option>
            <option value="fy">Financial year (Apr–Mar)</option>
            <option value="custom">Custom range</option>
            </select>
          </label>
          {preset === 'custom' ? (
            <>
              <label className="flex flex-col gap-1">
                <span className={clsx('text-xs font-medium', muted)}>From</span>
                <input type="date" className={dateInput} value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className={clsx('text-xs font-medium', muted)}>To</span>
                <input type="date" className={dateInput} value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </>
          ) : null}
          <AdminBtnSecondary type="button" onClick={() => download('csv')}>
            Export CSV
          </AdminBtnSecondary>
          <AdminBtnSecondary type="button" onClick={() => download('pdf')}>
            Export PDF
          </AdminBtnSecondary>
        </div>
      </AdminPanel>

      {report.isLoading ? <p className="text-sm text-slate-500">Calculating…</p> : null}

      {t ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="GST collected" value={`₹${t.gstCollectedInr.toLocaleString('en-IN')}`} className={statCard} muted={muted} />
            <Stat label="Taxable sales" value={`₹${t.taxableSalesInr.toLocaleString('en-IN')}`} className={statCard} muted={muted} />
            <Stat label="GST invoices" value={String(t.gstInvoiceCount)} className={statCard} muted={muted} />
            <Stat label="Non-GST invoices" value={String(t.nonGstInvoiceCount)} className={statCard} muted={muted} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <Stat label="CGST" value={`₹${t.cgstInr.toLocaleString('en-IN')}`} className={statCard} muted={muted} />
            <Stat label="SGST" value={`₹${t.sgstInr.toLocaleString('en-IN')}`} className={statCard} muted={muted} />
            <Stat label="IGST" value={`₹${t.igstInr.toLocaleString('en-IN')}`} className={statCard} muted={muted} />
          </div>

          <AdminPanel title="Monthly summary">
            <ul className="p-4 space-y-2 text-sm">
              {(report.data?.monthly ?? []).map((m) => (
                <li key={m.label} className="flex justify-between border-b border-white/5 pb-1">
                  <span>{m.label}</span>
                  <span className="tabular-nums">GST ₹{m.gst.toLocaleString('en-IN')} · Total ₹{m.total.toLocaleString('en-IN')} ({m.count})</span>
                </li>
              ))}
            </ul>
          </AdminPanel>

          <AdminPanel title="Invoice-level GST detail">
            <AdminTable
              headers={['Invoice', 'Customer', 'Date', 'GST?', 'Taxable', 'Tax', 'Total']}
              rows={(report.data?.invoices ?? []).map((r) => [
                r.invoiceNo,
                r.customerName,
                new Date(r.invoiceDate).toLocaleDateString('en-IN'),
                r.gstApplied ? 'Yes' : 'No',
                `₹${r.taxableInr.toLocaleString('en-IN')}`,
                `₹${(r.cgstInr + r.sgstInr + r.igstInr).toLocaleString('en-IN')}`,
                `₹${r.totalInr.toLocaleString('en-IN')}`,
              ])}
            />
          </AdminPanel>
        </>
      ) : null}
    </div>
  );
}

function Stat({ label, value, className, muted }: { label: string; value: string; className: string; muted: string }) {
  return (
    <div className={className}>
      <p className={clsx('text-xs uppercase tracking-wide', muted)}>{label}</p>
      <p className="text-lg font-bold mt-1 tabular-nums text-stone-900 dark:text-inherit">{value}</p>
    </div>
  );
}
