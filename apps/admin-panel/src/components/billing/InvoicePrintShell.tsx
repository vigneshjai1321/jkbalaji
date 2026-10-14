'use client';

import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { InvoiceDocument, type InvoiceDocumentProps } from './InvoiceDocument';

type Props = InvoiceDocumentProps & {
  toolbar?: React.ReactNode;
  onDownloadPdf?: () => void;
  banner?: React.ReactNode;
};

export function InvoicePrintShell({ toolbar, onDownloadPdf, banner, ...docProps }: Props) {
  return (
    <div className="billing-print-root min-h-screen bg-slate-100/90 dark:bg-slate-950 p-3 md:p-6 print:bg-white print:p-0">
      {banner}
      <div className="no-print max-w-[210mm] mx-auto flex flex-wrap items-center gap-2 mb-4">
        {toolbar}
        <span className="flex-1" />
        <AdminBtnPrimary type="button" className="!py-1.5 !px-3 !text-xs" onClick={() => window.print()}>
          Print A4
        </AdminBtnPrimary>
        {onDownloadPdf ? (
          <AdminBtnSecondary type="button" className="!py-1.5 !px-3 !text-xs" onClick={onDownloadPdf}>
            Download PDF
          </AdminBtnSecondary>
        ) : null}
      </div>
      <div className="invoice-print-wrap max-w-[210mm] mx-auto">
        <InvoiceDocument {...docProps} />
      </div>
    </div>
  );
}
