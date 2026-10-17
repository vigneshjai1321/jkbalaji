'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';
import { InvoicePrintShell } from '@/components/billing/InvoicePrintShell';
import { adminApiBase, adminAuthHeaders } from '@/lib/admin-api';
import {
  readBillingPreviewSession,
  waitForBillingPreviewSession,
  type BillingPreviewSession,
} from '@/lib/billing-preview-session';

export default function DraftInvoicePreviewPage() {
  const searchParams = useSearchParams();
  const previewId = searchParams.get('id');
  const [session, setSession] = useState<BillingPreviewSession | null>(null);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!previewId) {
        setLoadError('No preview session found. Open preview from Create Invoice (Preview Invoice button).');
        setLoading(false);
        return;
      }
      const immediate = readBillingPreviewSession(previewId);
      if (immediate) {
        if (!cancelled) {
          setSession(immediate);
          setLoading(false);
        }
        return;
      }
      const data = await waitForBillingPreviewSession(previewId);
      if (cancelled) return;
      if (!data) {
        setLoadError(
          'Preview data is not ready yet, or it expired. Return to the form and click Preview Invoice again.',
        );
        setSession(null);
      } else {
        setSession(data);
        setLoadError('');
      }
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [previewId]);

  if (loading) {
    return (
      <div className="billing-print-root min-h-screen bg-slate-200/70 p-8 max-w-lg mx-auto text-sm text-slate-700" role="status">
        <p>Loading invoice preview…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="billing-print-root min-h-screen bg-white p-8 max-w-lg mx-auto text-sm text-slate-700 space-y-4">
        <p className="text-red-600 font-medium">{loadError}</p>
        <Link href="/billing/invoices/new" className="text-emerald-700 hover:underline inline-block">
          Back to Create Invoice
        </Link>
      </div>
    );
  }

  if (!session) return null;

  const p = session.preview;

  async function downloadPdf() {
    const res = await fetch(`${adminApiBase()}/admin/billing/invoices/preview/pdf`, {
      method: 'POST',
      headers: adminAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(session!.previewPayload),
    });
    if (!res.ok) {
      alert('PDF download failed. Check you are still signed in.');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  const banner = session.sample ? (
    <div className="no-print max-w-[210mm] mx-auto mb-3 rounded-lg border border-amber-400 bg-amber-50 px-4 py-2 text-sm text-amber-900 text-center font-semibold">
      DEMO / SAMPLE — Not saved · Not included in GST reports
    </div>
  ) : (
    <div className="no-print max-w-[210mm] mx-auto mb-3 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm text-sky-900 text-center">
      Preview only — not saved or issued
    </div>
  );

  return (
    <InvoicePrintShell
      banner={banner}
      onDownloadPdf={downloadPdf}
      toolbar={
        <>
          <Link href={session.returnPath}>
            <AdminBtnSecondary type="button">Back to Create Invoice</AdminBtnSecondary>
          </Link>
          <AdminBtnSecondary type="button" onClick={() => window.close()}>
            Close preview
          </AdminBtnSecondary>
        </>
      }
      seller={session.seller}
      invoiceNo={session.invoiceNo}
      status={session.sample ? 'SAMPLE' : 'PREVIEW'}
      gstApplied={session.gstApplied}
      invoiceDate={session.invoiceDate}
      dueDate={session.dueDate ?? null}
      customer={session.customer}
      lines={p.lines.map((l) => ({ ...l, unit: l.unit ?? 'nos' }))}
      subtotalInr={p.totals.subtotalInr}
      discountInr={p.totals.discountInr}
      cgstInr={p.totals.cgstInr}
      sgstInr={p.totals.sgstInr}
      igstInr={p.totals.igstInr}
      totalInr={p.totals.totalInr}
      paymentTerms={session.paymentTerms}
      notes={session.notes}
    />
  );
}
