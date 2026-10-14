'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { suggestDueDateFromTerms } from '@/lib/billing-due-date';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { adminFetch } from '@/lib/admin-api';
import type { InvoiceLine, SellerProfile } from '@/lib/billing-types';
import { AdminBtnPrimary, AdminBtnSecondary, useAdminInputClass } from '@/components/admin/AdminForm';
import { CustomerPicker, type BillingCustomer } from './CustomerPicker';
import { openInvoicePreviewInNewTab } from '@/lib/billing-open-preview';
import type { PreviewInvoiceInput } from '@/lib/billing-preview-session';

type Preview = {
  taxMode: string;
  gstApplied: boolean;
  lines: Array<InvoiceLine & { taxableInr: number; cgstInr: number; sgstInr: number; igstInr: number; amountInr: number }>;
  totals: {
    subtotalInr: number;
    discountInr: number;
    cgstInr: number;
    sgstInr: number;
    igstInr: number;
    totalInr: number;
  };
};

const emptyLine = (defaultRate: number): InvoiceLine => ({
  description: '',
  hsnSac: '',
  unit: 'nos',
  qty: 1,
  rateInr: 0,
  discountInr: 0,
  gstRatePct: defaultRate,
});

type Props = {
  mode: 'create' | 'edit';
  invoiceId?: string;
  invoiceNo?: string;
  initialAmountPaid?: number;
  initial?: {
    customerId: string;
    invoiceDate: string;
    dueDate?: string;
    paymentTerms?: string;
    notes?: string;
    gstApplied?: boolean;
    lines: InvoiceLine[];
  };
  onSaved: (id?: string) => void;
  initialStatus?: string;
};

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="pb-4 mb-4 border-b border-slate-200 last:border-b-0 last:mb-0 last:pb-0">
      <h2 className="text-sm font-semibold mb-2.5 text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

export function InvoiceForm({ mode, invoiceId, invoiceNo, initialAmountPaid = 0, initial, onSaved, initialStatus }: Props) {
  const input = useAdminInputClass();
  const router = useRouter();
  const labelClass = 'block text-sm font-medium mb-1 text-slate-700';
  const hintClass = 'text-xs mt-1 text-slate-500';

  const [customerId, setCustomerId] = useState(initial?.customerId ?? '');
  const [customerSnap, setCustomerSnap] = useState<BillingCustomer | undefined>();
  const [invoiceDate, setInvoiceDate] = useState(initial?.invoiceDate ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [paymentTerms, setPaymentTerms] = useState(initial?.paymentTerms ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [gstApplied, setGstApplied] = useState(initial?.gstApplied ?? true);
  const [lines, setLines] = useState<InvoiceLine[]>(initial?.lines?.length ? initial.lines : [emptyLine(3)]);
  const [draftInvoiceNo, setDraftInvoiceNo] = useState(invoiceNo ?? '');
  const [totals, setTotals] = useState<Preview['totals'] | null>(null);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const dueDateTouched = useRef(Boolean(initial?.dueDate));
  const invoiceNoTouched = useRef(Boolean(invoiceNo));

  const seller = useQuery({
    queryKey: ['billing-seller'],
    queryFn: () => adminFetch<SellerProfile>('/billing/seller'),
  });

  const nextNoQuery = useQuery({
    queryKey: ['billing-next-invoice-no', invoiceDate],
    queryFn: async () => {
      const r = await adminFetch<{ invoiceNo: string }>(`/billing/invoices/next-number?date=${encodeURIComponent(invoiceDate)}`);
      return r.invoiceNo;
    },
    enabled: mode === 'create',
  });

  const selectedCustomer = useQuery({
    queryKey: ['billing-customer', customerId],
    queryFn: () => adminFetch<BillingCustomer>(`/billing/customers/${customerId}`),
    enabled: Boolean(customerId),
  });

  useEffect(() => {
    if (selectedCustomer.data) setCustomerSnap(selectedCustomer.data);
  }, [selectedCustomer.data]);

  useEffect(() => {
    if (mode === 'create' && nextNoQuery.data && !invoiceNoTouched.current) {
      setDraftInvoiceNo(nextNoQuery.data);
    }
  }, [nextNoQuery.data, mode]);

  useEffect(() => {
    if (mode === 'edit' && invoiceNo) setDraftInvoiceNo(invoiceNo);
  }, [mode, invoiceNo]);

  useEffect(() => {
    if (mode === 'create' && seller.data) {
      if (!paymentTerms && seller.data.paymentTermsDefault) setPaymentTerms(seller.data.paymentTermsDefault);
      if (initial?.gstApplied === undefined) setGstApplied(seller.data.defaultApplyGst);
    }
  }, [seller.data, paymentTerms, mode, initial?.gstApplied]);

  useEffect(() => {
    if (dueDateTouched.current) return;
    const suggested = suggestDueDateFromTerms(invoiceDate, paymentTerms);
    if (suggested) setDueDate(suggested);
  }, [invoiceDate, paymentTerms]);

  const defaultRate = seller.data?.authorizedTaxRates?.find((r) => r > 0) ?? 3;
  const taxRates = seller.data?.authorizedTaxRates ?? [0, 3, 5, 12, 18];

  const previewInput = useCallback((): PreviewInvoiceInput => {
    return {
      customerId: customerId || undefined,
      invoiceDate,
      dueDate: dueDate || undefined,
      paymentTerms: paymentTerms || undefined,
      notes: notes || undefined,
      gstApplied,
      invoiceNo: draftInvoiceNo.trim() || undefined,
      lines: lines.filter((l) => l.description.trim()),
    };
  }, [customerId, invoiceDate, dueDate, paymentTerms, notes, gstApplied, lines, draftInvoiceNo]);

  useEffect(() => {
    const validLines = lines.filter((l) => l.description.trim());
    if (!customerId || validLines.length === 0) {
      setTotals(null);
      setTotalsLoading(false);
      return;
    }
    setTotalsLoading(true);
    const handle = setTimeout(() => {
      adminFetch<Preview>('/billing/invoices/preview', { method: 'POST', body: JSON.stringify(previewInput()) })
        .then((p) => setTotals(p.totals))
        .catch(() => setTotals(null))
        .finally(() => setTotalsLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [customerId, invoiceDate, dueDate, paymentTerms, notes, gstApplied, lines, draftInvoiceNo, previewInput]);

  const saveMut = useMutation({
    mutationFn: async (issue: boolean) => {
      const body = { ...previewInput(), customerId, issue, invoiceNo: draftInvoiceNo.trim() || undefined };
      if (mode === 'edit' && invoiceId) {
        await adminFetch(`/billing/invoices/${invoiceId}`, { method: 'PATCH', body: JSON.stringify(body) });
        if (issue && initialStatus === 'DRAFT') {
          return adminFetch<{ id: string }>(`/billing/invoices/${invoiceId}/issue`, { method: 'POST' });
        }
        return { id: invoiceId };
      }
      return adminFetch<{ id: string }>('/billing/invoices', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: (data) => onSaved((data as { id?: string }).id ?? invoiceId),
    onError: (e: Error) => setFormError(e.message || 'Save failed'),
  });

  const isDraftEdit = mode === 'edit' && initialStatus === 'DRAFT';
  const canEditInvoiceNo = mode === 'create' || isDraftEdit;
  const customer = customerSnap ?? selectedCustomer.data;
  const returnPath = mode === 'edit' && invoiceId ? `/billing/invoices/${invoiceId}` : '/billing/invoices/new';
  const issuer = seller.data;

  const taxableInr = totals ? Math.max(0, totals.subtotalInr - totals.discountInr) : null;
  const grandTotal = totals?.totalInr ?? null;
  const amountPaid = mode === 'edit' ? initialAmountPaid : 0;
  const balanceDue = grandTotal != null ? Math.max(0, grandTotal - amountPaid) : null;

  const issuerIssues: string[] = [];
  if (issuer) {
    if (!issuer.address?.trim()) issuerIssues.push('shop address');
    if (!issuer.phone?.trim()) issuerIssues.push('phone');
    if (!issuer.email?.trim()) issuerIssues.push('billing email');
    if (gstApplied && !issuer.gstin?.trim()) issuerIssues.push('GSTIN (required for tax invoices)');
  }

  async function handlePreview() {
    setFormError('');
    if (!seller.data) {
      setFormError('Billing settings still loading. Try again in a moment.');
      return;
    }
    if (!customerId || !customer) {
      setFormError('Select a customer before preview.');
      return;
    }
    if (!lines.some((l) => l.description.trim())) {
      setFormError('Add at least one line item with a description.');
      return;
    }
    setPreviewBusy(true);
    try {
      await openInvoicePreviewInNewTab({
        previewInput: previewInput(),
        seller: seller.data,
        customer,
        invoiceDate,
        dueDate: dueDate || undefined,
        paymentTerms,
        notes,
        gstApplied,
        sample: false,
        returnPath,
        invoiceNo: draftInvoiceNo.trim() || 'PREVIEW',
      });
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not open preview.');
    } finally {
      setPreviewBusy(false);
    }
  }

  return (
    <div className="w-full max-w-none">
      {formError ? (
        <p className="text-sm text-red-700 rounded-lg border border-red-200 bg-red-50 px-3 py-2 mb-3">{formError}</p>
      ) : null}
      {saveMut.isPending ? <p className="text-sm mb-3 text-emerald-700">Saving invoice…</p> : null}
      {issuerIssues.length > 0 ? (
        <p className="text-sm text-amber-800 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 mb-3">
          Complete Billing Settings before issuing: missing {issuerIssues.join(', ')}.
        </p>
      ) : null}

      <FormSection title="Invoice details">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className={clsx(labelClass, 'sm:col-span-2 lg:col-span-1')}>
            Invoice number
            <input
              className={`${input} mt-0.5 font-mono text-sm`}
              value={draftInvoiceNo}
              disabled={!canEditInvoiceNo}
              onChange={(e) => {
                invoiceNoTouched.current = true;
                setDraftInvoiceNo(e.target.value.toUpperCase());
              }}
            />
            {mode === 'create' ? <span className={hintClass}>Suggested next number — edit before save if needed.</span> : null}
          </label>
          <label className={labelClass}>
            Invoice date
            <input type="date" className={`${input} mt-0.5`} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
          </label>
          <label className={labelClass}>
            Due date
            <input
              type="date"
              className={`${input} mt-0.5`}
              value={dueDate}
              onChange={(e) => {
                dueDateTouched.current = true;
                setDueDate(e.target.value);
              }}
            />
          </label>
          <label className={clsx(labelClass, 'sm:col-span-2 lg:col-span-4')}>
            Payment terms
            <input className={`${input} mt-0.5`} value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
          </label>
        </div>
      </FormSection>

      <FormSection title="Customer details">
        <CustomerPicker
          value={customerId}
          onChange={(id, c) => {
            setCustomerId(id);
            if (c) setCustomerSnap(c);
            else setCustomerSnap(undefined);
          }}
        />
      </FormSection>

      <FormSection title="Invoice items">
        <div className="flex justify-end mb-2">
          <AdminBtnSecondary type="button" className="!py-1.5 !px-3 !text-xs" onClick={() => setLines((ls) => [...ls, emptyLine(defaultRate)])}>
            + Add item
          </AdminBtnSecondary>
        </div>
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="grid gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/90 text-sm grid-cols-2 md:grid-cols-6 lg:grid-cols-8">
              <input
                className={`${input} col-span-2 md:col-span-2`}
                placeholder="Description *"
                value={line.description}
                onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, description: e.target.value } : l)))}
              />
              {gstApplied ? (
                <input
                  className={`${input} col-span-1`}
                  placeholder="HSN/SAC"
                  value={line.hsnSac ?? ''}
                  onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, hsnSac: e.target.value } : l)))}
                />
              ) : null}
              <input
                type="number"
                min={0}
                className={input}
                placeholder="Qty"
                value={line.qty}
                onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, qty: Number(e.target.value) } : l)))}
              />
              <input className={input} placeholder="Unit" value={line.unit ?? 'nos'} onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, unit: e.target.value } : l)))} />
              <input
                type="number"
                min={0}
                className={input}
                placeholder="Price ₹"
                value={line.rateInr || ''}
                onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, rateInr: Number(e.target.value) } : l)))}
              />
              <input
                type="number"
                min={0}
                className={input}
                placeholder="Disc ₹"
                value={line.discountInr ?? ''}
                onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, discountInr: Number(e.target.value) } : l)))}
              />
              {gstApplied ? (
                <select className={input} value={line.gstRatePct ?? defaultRate} onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, gstRatePct: Number(e.target.value) } : l)))}>
                  {taxRates.map((r) => (
                    <option key={r} value={r}>
                      GST {r}%
                    </option>
                  ))}
                </select>
              ) : null}
              {lines.length > 1 ? (
                <button type="button" className="col-span-2 md:col-span-8 text-left text-xs text-red-600 hover:text-red-700 py-1" onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}>
                  Remove item
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="GST settings">
        <label className="flex items-center gap-2 text-sm cursor-pointer text-slate-700">
          <input type="checkbox" checked={gstApplied} onChange={(e) => setGstApplied(e.target.checked)} className="rounded" />
          Apply GST on this invoice
        </label>
        <p className={clsx(hintClass, 'mt-2')}>
          {gstApplied ? 'Tax split follows seller/customer state. GSTIN required on issue for tax invoices.' : 'Non-GST bill — no tax break-up on the printout.'}
        </p>
      </FormSection>

      <FormSection title="Totals and payment details">
        {totalsLoading ? <p className={hintClass}>Calculating totals…</p> : null}
        {!totals && !totalsLoading ? <p className={hintClass}>Select a customer and add line items to see totals.</p> : null}
        {totals ? (
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm max-w-2xl">
            <SummaryRow label="Subtotal" value={totals.subtotalInr} />
            <SummaryRow label="Discount" value={totals.discountInr} />
            <SummaryRow label="Taxable amount" value={taxableInr ?? 0} />
            {gstApplied && totals.cgstInr > 0 ? (
              <>
                <SummaryRow label="CGST" value={totals.cgstInr} />
                <SummaryRow label="SGST" value={totals.sgstInr} />
              </>
            ) : null}
            {gstApplied && totals.igstInr > 0 ? <SummaryRow label="IGST" value={totals.igstInr} /> : null}
            <SummaryRow label="Grand Total" value={totals.totalInr} strong />
            <SummaryRow label="Amount paid" value={amountPaid} />
            <SummaryRow label="Balance due" value={balanceDue ?? totals.totalInr} strong />
          </dl>
        ) : null}
      </FormSection>

      <FormSection title="Notes">
        <label className={labelClass}>
          Optional notes
          <textarea className={`${input} mt-0.5`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Shown on the invoice when filled" />
        </label>
      </FormSection>

      <section className="pt-4 mt-2 border-t border-slate-200">
        <h2 className="text-sm font-semibold mb-3 text-slate-800">Invoice actions</h2>
        <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-2 sm:justify-end">
          <AdminBtnSecondary type="button" onClick={() => router.push('/billing')} disabled={saveMut.isPending}>
            Cancel
          </AdminBtnSecondary>
          <AdminBtnSecondary type="button" disabled={previewBusy || saveMut.isPending || !customerId} onClick={() => handlePreview()}>
            {previewBusy ? 'Opening preview…' : 'Preview Invoice'}
          </AdminBtnSecondary>
          {mode === 'create' || isDraftEdit ? (
            <AdminBtnSecondary type="button" disabled={saveMut.isPending || !customerId} onClick={() => saveMut.mutate(false)}>
              {mode === 'edit' ? 'Save changes' : 'Save Draft'}
            </AdminBtnSecondary>
          ) : (
            <AdminBtnPrimary type="button" disabled={saveMut.isPending || !customerId} onClick={() => saveMut.mutate(false)}>
              Update invoice
            </AdminBtnPrimary>
          )}
          {mode === 'create' || isDraftEdit ? (
            <AdminBtnPrimary type="button" disabled={saveMut.isPending || !customerId} onClick={() => saveMut.mutate(true)}>
              Save & Issue
            </AdminBtnPrimary>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div
      className={clsx(
        'flex justify-between gap-4',
        strong ? 'sm:col-span-2 font-bold text-lg text-slate-900 pt-2 border-t border-slate-300' : '',
      )}
    >
      <dt className={strong ? undefined : 'text-slate-500'}>{label}</dt>
      <dd className="tabular-nums">₹{value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
    </div>
  );
}
