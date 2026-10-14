'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminFetch, adminApiBase } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';
import type { GstReport } from '@/lib/billing-types';

export default function GstReportsPage() {
  const [preset, setPreset] = useState('month');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

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
    const token = localStorage.getItem('jk_token');
    const url = `${adminApiBase()}/admin/billing/reports/gst/export.${kind}?${params}`;
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = kind === 'csv' ? 'gst-report.csv' : 'gst-report.pdf';
        a.click();
      });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/billing" className="text-sm text-emerald-400 hover:underline">
          ← Billing
        </Link>
        <h1 className="text-xl font-bold">GST & Tax Reports</h1>
      </div>
      <p className="text-sm text-amber-200/80 max-w-3xl">{report.data?.disclaimer ?? 'Internal summaries from issued invoices only.'}</p>

      <AdminPanel title="Period">
        <div className="p-4 flex flex-wrap gap-3 items-end">
          <select className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm" value={preset} onChange={(e) => setPreset(e.target.value)}>
            <option value="today">Today</option>
            <option value="month">This month</option>
            <option value="prev_month">Previous month</option>
            <option value="fy">Financial year (Apr–Mar)</option>
            <option value="custom">Custom range</option>
          </select>
          {preset === 'custom' ? (
            <>
              <input type="date" className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" className="rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
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
            <Stat label="GST collected" value={`₹${t.gstCollectedInr.toLocaleString('en-IN')}`} />
            <Stat label="Taxable sales" value={`₹${t.taxableSalesInr.toLocaleString('en-IN')}`} />
            <Stat label="GST invoices" value={String(t.gstInvoiceCount)} />
            <Stat label="Non-GST invoices" value={String(t.nonGstInvoiceCount)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <Stat label="CGST" value={`₹${t.cgstInr.toLocaleString('en-IN')}`} />
            <Stat label="SGST" value={`₹${t.sgstInr.toLocaleString('en-IN')}`} />
            <Stat label="IGST" value={`₹${t.igstInr.toLocaleString('en-IN')}`} />
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-lg font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
