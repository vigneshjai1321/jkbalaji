'use client';

import { useMemo } from 'react';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { InvoiceDocument, type InvoiceDocumentProps } from './InvoiceDocument';
import { suggestInvoiceSheetLayout } from '@/lib/invoice-sheet-layout';

type Props = InvoiceDocumentProps & {
  toolbar?: React.ReactNode;
  onDownloadPdf?: () => void;
  banner?: React.ReactNode;
};

export function InvoicePrintShell({ toolbar, onDownloadPdf, banner, ...docProps }: Props) {
  const sheetLayout = useMemo(
    () => docProps.sheetLayout ?? suggestInvoiceSheetLayout(docProps.lines.length, docProps.notes),
    [docProps.sheetLayout, docProps.lines.length, docProps.notes],
  );

  return (
    <div className="billing-print-root min-h-screen bg-slate-200/70 dark:bg-slate-950 p-3 md:p-6 print:bg-white print:p-0">
      {banner}
      <div className="no-print max-w-[210mm] mx-auto flex flex-wrap items-center gap-2 mb-4" role="toolbar" aria-label="Invoice preview actions">
        {toolbar}
        <span className="flex-1" />
        <AdminBtnPrimary type="button" className="!py-1.5 !px-3 !text-xs" onClick={() => window.print()} aria-label="Print invoice on A4 paper">
          Print A4
        </AdminBtnPrimary>
        {onDownloadPdf ? (
          <AdminBtnSecondary type="button" className="!py-1.5 !px-3 !text-xs" onClick={onDownloadPdf} aria-label="Download invoice PDF">
            Download PDF
          </AdminBtnSecondary>
        ) : null}
      </div>
      <div className="invoice-print-wrap max-w-[210mm] mx-auto flex justify-center">
        <InvoiceDocument {...docProps} sheetLayout={sheetLayout} />
      </div>
    </div>
  );
}
