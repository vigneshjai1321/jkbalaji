'use client';

import { useMemo, useState } from 'react';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { InvoiceDocument, type InvoiceDocumentProps } from './InvoiceDocument';
import { suggestInvoicePrintLayout, type InvoicePrintLayout } from '@/lib/invoice-print-layout';

type Props = InvoiceDocumentProps & {
  toolbar?: React.ReactNode;
  onDownloadPdf?: () => void;
  banner?: React.ReactNode;
};

export function InvoicePrintShell({ toolbar, onDownloadPdf, banner, ...docProps }: Props) {
  const suggested = useMemo(
    () => suggestInvoicePrintLayout(docProps.lines.length, docProps.notes),
    [docProps.lines.length, docProps.notes],
  );
  const [layout, setLayout] = useState<InvoicePrintLayout>(suggested);

  return (
    <div className="billing-print-root min-h-screen bg-slate-200/80 dark:bg-slate-950 p-3 md:p-4 print:bg-white print:p-0">
      {banner}
      <div className="no-print max-w-[210mm] mx-auto flex flex-wrap items-center gap-2 mb-3">
        {toolbar}
        <span className="flex-1" />
        <span className="text-xs text-slate-600 dark:text-slate-400 mr-1">Print layout:</span>
        <button
          type="button"
          className={`text-xs px-2.5 py-1.5 rounded-lg border ${layout === 'compact' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 bg-white'}`}
          onClick={() => setLayout('compact')}
        >
          Compact bill
        </button>
        <button
          type="button"
          className={`text-xs px-2.5 py-1.5 rounded-lg border ${layout === 'full' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300 bg-white'}`}
          onClick={() => setLayout('full')}
        >
          Full A4
        </button>
        <AdminBtnPrimary type="button" className="!py-1.5 !px-3 !text-xs" onClick={() => window.print()}>
          {layout === 'full' ? 'Print A4' : 'Print bill'}
        </AdminBtnPrimary>
        {onDownloadPdf ? (
          <AdminBtnSecondary type="button" className="!py-1.5 !px-3 !text-xs" onClick={onDownloadPdf}>
            Download PDF
          </AdminBtnSecondary>
        ) : null}
      </div>
      <div className={layout === 'compact' ? 'invoice-print-compact-wrap' : 'invoice-print-full-wrap'}>
        <InvoiceDocument {...docProps} layout={layout} />
      </div>
    </div>
  );
}
