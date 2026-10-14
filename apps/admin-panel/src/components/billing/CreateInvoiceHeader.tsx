'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { Eye, FileText, RotateCcw, Save } from 'lucide-react';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';

type Props = {
  subtitle?: string;
  statusLabel: string;
  statusTone: 'draft' | 'unsaved' | 'saved';
  previewBusy: boolean;
  savePending: boolean;
  onPreview: () => void;
  onSaveDraft: () => void;
  onIssue: () => void;
  onReset?: () => void;
  showReset: boolean;
};

export function CreateInvoiceHeader({
  subtitle,
  statusLabel,
  statusTone,
  previewBusy,
  savePending,
  onPreview,
  onSaveDraft,
  onIssue,
  onReset,
  showReset,
}: Props) {
  const badge =
    statusTone === 'unsaved'
      ? 'bg-amber-100 text-amber-950 border-amber-200'
      : statusTone === 'saved'
        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
        : 'bg-stone-100 text-stone-700 border-stone-200';

  return (
    <header className="mb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/billing"
            className="text-sm text-amber-800/90 hover:text-amber-950 font-medium inline-flex items-center gap-1 mb-2"
          >
            ← Billing
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-900">Create Invoice</h1>
            <span className={clsx('text-xs font-medium px-2.5 py-1 rounded-full border', badge)}>{statusLabel}</span>
          </div>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            {subtitle ?? 'Jewellery tax invoice — add items, preview in a new tab, then save as draft or issue.'}
          </p>
        </div>
        <div
          className="flex flex-col sm:flex-row flex-wrap gap-2 lg:justify-end shrink-0"
          role="toolbar"
          aria-label="Invoice actions"
        >
          {showReset && onReset ? (
            <AdminBtnSecondary type="button" onClick={onReset} disabled={savePending || previewBusy} className="gap-1.5">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Reset
            </AdminBtnSecondary>
          ) : null}
          <AdminBtnSecondary type="button" disabled={previewBusy || savePending} onClick={onPreview} className="gap-1.5">
            <Eye className="h-4 w-4" aria-hidden />
            {previewBusy ? 'Opening…' : 'Preview Invoice'}
          </AdminBtnSecondary>
          <AdminBtnSecondary type="button" disabled={savePending} onClick={onSaveDraft} className="gap-1.5">
            <Save className="h-4 w-4" aria-hidden />
            Save Draft
          </AdminBtnSecondary>
          <AdminBtnPrimary type="button" disabled={savePending} onClick={onIssue} className="gap-1.5 !bg-amber-800 hover:!bg-amber-900">
            <FileText className="h-4 w-4" aria-hidden />
            Save & Issue Invoice
          </AdminBtnPrimary>
        </div>
      </div>
    </header>
  );
}
