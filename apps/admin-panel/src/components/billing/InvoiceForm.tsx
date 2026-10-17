'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { suggestDueDateFromTerms } from '@/lib/billing-due-date';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { adminFetch } from '@/lib/admin-api';
import type { InvoiceLine, SellerProfile } from '@/lib/billing-types';
import { Calendar, Gem, Receipt, StickyNote, User } from 'lucide-react';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { useBillingInputClass, useBillingSelectClass } from '@/components/billing/billing-theme';
import { CustomerPicker, type BillingCustomer } from './CustomerPicker';
import { CreateInvoiceHeader } from './CreateInvoiceHeader';
import { BillingAlert, BillingFormSection, InvoiceSummaryCard } from './create-invoice-ui';
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

export function InvoiceForm({ mode, invoiceId, invoiceNo, initialAmountPaid = 0, initial, onSaved, initialStatus }: Props) {
  const input = useBillingInputClass();
  const selectClass = useBillingSelectClass();
  const router = useRouter();
  const labelClass = 'block text-sm font-medium mb-1 text-stone-800';
  const hintClass = 'text-xs mt-1 text-stone-500';

  const [customerId, setCustomerId] = useState(initial?.customerId ?? '');
  const [customerSnap, setCustomerSnap] = useState<BillingCustomer | undefined>();
  const [invoiceDate, setInvoiceDate] = useState(initial?.invoiceDate ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? '');
  const [paymentTerms, setPaymentTerms] = useState(initial?.paymentTerms ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [gstApplied, setGstApplied] = useState(initial?.gstApplied ?? true);
  const [lines, setLines] = useState<InvoiceLine[]>(initial?.lines?.length ? initial.lines : [emptyLine(3)]);
  const [draftInvoiceNo, setDraftInvoiceNo] = useState(invoiceNo ?? '');
  const [paymentChoice, setPaymentChoice] = useState<'PAID' | 'UNPAID'>(
    mode === 'edit' && initialStatus === 'PAID' ? 'PAID' : mode === 'create' ? 'PAID' : 'UNPAID',
  );
  const [totals, setTotals] = useState<Preview['totals'] | null>(null);
  const [totalsLoading, setTotalsLoading] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ customer?: string; lines?: string }>({});
  const [previewFallbackUrl, setPreviewFallbackUrl] = useState('');
  const dueDateTouched = useRef(Boolean(initial?.dueDate));
  const invoiceNoTouched = useRef(Boolean(invoiceNo));
  const initialCreateSnapshot = useRef<string | null>(null);

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
      const body = {
        ...previewInput(),
        customerId,
        issue,
        settleAsPaid: issue ? paymentChoice === 'PAID' : mode === 'edit' && initialStatus === 'UNPAID' ? paymentChoice === 'PAID' : false,
        invoiceNo: draftInvoiceNo.trim() || undefined,
      };
      if (mode === 'edit' && invoiceId) {
        await adminFetch(`/billing/invoices/${invoiceId}`, { method: 'PATCH', body: JSON.stringify(body) });
        if (issue && initialStatus === 'DRAFT') {
          return adminFetch<{ id: string }>(`/billing/invoices/${invoiceId}/issue`, {
            method: 'POST',
            body: JSON.stringify({ settleAsPaid: paymentChoice === 'PAID' }),
          });
        }
        return { id: invoiceId };
      }
      return adminFetch<{ id: string }>('/billing/invoices', { method: 'POST', body: JSON.stringify(body) });
    },
    onSuccess: (data) => {
      setFormError('');
      onSaved((data as { id?: string }).id ?? invoiceId);
    },
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

  function validateForPreviewOrSave() {
    const errs: { customer?: string; lines?: string } = {};
    if (!customerId || !customer) errs.customer = 'Select or create a customer.';
    if (!lines.some((l) => l.description.trim())) errs.lines = 'Add at least one jewellery item with a description.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function formSnapshot() {
    return JSON.stringify({ customerId, invoiceDate, dueDate, paymentTerms, notes, gstApplied, lines, draftInvoiceNo });
  }

  useEffect(() => {
    if (mode !== 'create' || initialCreateSnapshot.current !== null) return;
    const t = window.setTimeout(() => {
      initialCreateSnapshot.current = formSnapshot();
    }, 600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- baseline after seller defaults load
  }, [mode, seller.data, nextNoQuery.data]);

  const isDirty =
    mode === 'create' &&
    initialCreateSnapshot.current !== null &&
    formSnapshot() !== initialCreateSnapshot.current;

  useEffect(() => {
    if (mode !== 'create' || !isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [mode, isDirty]);

  function handleReset() {
    if (mode !== 'create') return;
    const dirty = initialCreateSnapshot.current !== null && formSnapshot() !== initialCreateSnapshot.current;
    if (dirty && !window.confirm('Reset the form? Entered invoice details will be cleared.')) return;
    setCustomerId('');
    setCustomerSnap(undefined);
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setDueDate('');
    setPaymentTerms(seller.data?.paymentTermsDefault ?? '');
    setNotes('');
    setGstApplied(seller.data?.defaultApplyGst ?? true);
    setLines([emptyLine(defaultRate)]);
    setDraftInvoiceNo('');
    invoiceNoTouched.current = false;
    dueDateTouched.current = false;
    setFieldErrors({});
    setFormError('');
    setPreviewFallbackUrl('');
    initialCreateSnapshot.current = formSnapshot();
  }

  async function handlePreview() {
    setFormError('');
    setPreviewFallbackUrl('');
    if (!seller.data) {
      setFormError('Billing settings still loading. Try again in a moment.');
      return;
    }
    if (!validateForPreviewOrSave()) return;
    if (!customer) return;
    setPreviewBusy(true);
    try {
      const result = await openInvoicePreviewInNewTab({
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
      if (!result.ok && result.blocked) {
        setPreviewFallbackUrl(result.previewUrl);
        setFormError('Pop-up blocked. Use the link below to open the preview.');
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not open preview.');
    } finally {
      setPreviewBusy(false);
    }
  }

  function doSaveDraft() {
    if (!validateForPreviewOrSave()) return;
    saveMut.mutate(false);
  }

  function doIssue() {
    if (!validateForPreviewOrSave()) return;
    const no = draftInvoiceNo.trim() || nextNoQuery.data || 'this invoice';
    if (
      !window.confirm(
        paymentChoice === 'PAID'
          ? `Issue invoice ${no} as Paid? A payment for the full total will be recorded. The invoice is not marked paid without that payment.`
          : `Issue invoice ${no} as Unpaid? No payment will be recorded.`,
      )
    ) {
      return;
    }
    saveMut.mutate(true);
  }

  const alerts = (
    <>
      {formError ? <BillingAlert tone="error">{formError}</BillingAlert> : null}
      {previewFallbackUrl ? (
        <BillingAlert tone="info">
          <a href={previewFallbackUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-900 underline">
            Open invoice preview in a new tab
          </a>
        </BillingAlert>
      ) : null}
      {saveMut.isPending ? <BillingAlert tone="info">Saving invoice…</BillingAlert> : null}
      {issuerIssues.length > 0 ? (
        <BillingAlert tone="warn">
          Complete Billing Settings before issuing: missing {issuerIssues.join(', ')}.
        </BillingAlert>
      ) : null}
    </>
  );

  const invoiceDetails = (
    <BillingFormSection step={1} title="Invoice details" subtitle="Number, dates, and payment terms" icon={Calendar}>
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
          Payment status
          <select
            className={`${selectClass} mt-0.5`}
            value={paymentChoice}
            onChange={(e) => setPaymentChoice(e.target.value === 'UNPAID' ? 'UNPAID' : 'PAID')}
          >
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
          </select>
          <span className={hintClass}>
            Paid records a payment for the invoice total when you issue or update an unpaid invoice. A draft save does not mark it paid.
          </span>
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
    </BillingFormSection>
  );

  const customerSection = (
    <BillingFormSection step={2} title="Customer details" subtitle="Search existing customers or add a new one" icon={User}>
      <CustomerPicker
        value={customerId}
        onChange={(id, c) => {
          setCustomerId(id);
          if (c) setCustomerSnap(c);
          else setCustomerSnap(undefined);
          if (id) setFieldErrors((e) => ({ ...e, customer: undefined }));
        }}
      />
      {fieldErrors.customer ? <p className="text-xs text-red-600 mt-2" role="alert">{fieldErrors.customer}</p> : null}
      {customer ? (
        <dl className="mt-4 grid gap-2 sm:grid-cols-2 text-sm rounded-lg border border-stone-200/80 bg-stone-50/80 px-3 py-2.5">
          <div>
            <dt className="text-xs text-stone-500">Name</dt>
            <dd className="font-medium text-stone-900">{customer.name}</dd>
          </div>
          {customer.phone ? (
            <div>
              <dt className="text-xs text-stone-500">Phone</dt>
              <dd className="text-stone-800">{customer.phone}</dd>
            </div>
          ) : null}
          {customer.gstin ? (
            <div className="sm:col-span-2">
              <dt className="text-xs text-stone-500">GSTIN</dt>
              <dd className="font-mono text-stone-800">{customer.gstin}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </BillingFormSection>
  );

  const itemsSection = (
    <BillingFormSection step={3} title="Jewellery items" subtitle="Descriptions, quantity, rate, discount, and GST per line" icon={Gem}>
      <div className="flex justify-end mb-3">
        <AdminBtnSecondary
          type="button"
          className="!py-2 !px-3 !text-sm border-amber-200/80 text-amber-950"
          onClick={() => setLines((ls) => [...ls, emptyLine(defaultRate)])}
        >
          + Add item
        </AdminBtnSecondary>
      </div>
      <div className="hidden md:block overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-stone-50 text-left text-xs font-medium uppercase tracking-wide text-stone-500 border-b border-stone-200">
            <tr>
              <th className="px-3 py-2.5 font-semibold normal-case">Description</th>
              {gstApplied ? <th className="px-2 py-2.5 w-24">HSN/SAC</th> : null}
              <th className="px-2 py-2.5 w-16">Qty</th>
              <th className="px-2 py-2.5 w-20">Unit</th>
              <th className="px-2 py-2.5 w-28">Rate (₹)</th>
              <th className="px-2 py-2.5 w-24">Disc (₹)</th>
              {gstApplied ? <th className="px-2 py-2.5 w-24">GST</th> : null}
              <th className="px-2 py-2.5 w-16" aria-label="Remove" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {lines.map((line, idx) => (
              <tr key={idx} className="bg-white">
                <td className="px-2 py-1.5">
                  <input
                    className={input}
                    placeholder="Item description *"
                    aria-label={`Item ${idx + 1} description`}
                    value={line.description}
                    onChange={(e) => {
                      setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, description: e.target.value } : l)));
                      setFieldErrors((fe) => ({ ...fe, lines: undefined }));
                    }}
                  />
                </td>
                {gstApplied ? (
                  <td className="px-2 py-1.5">
                    <input
                      className={input}
                      placeholder="HSN"
                      value={line.hsnSac ?? ''}
                      onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, hsnSac: e.target.value } : l)))}
                    />
                  </td>
                ) : null}
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    className={input}
                    value={line.qty}
                    onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, qty: Number(e.target.value) } : l)))}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={input}
                    value={line.unit ?? 'nos'}
                    onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, unit: e.target.value } : l)))}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    className={input}
                    value={line.rateInr || ''}
                    onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, rateInr: Number(e.target.value) } : l)))}
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    type="number"
                    min={0}
                    className={input}
                    value={line.discountInr ?? ''}
                    onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, discountInr: Number(e.target.value) } : l)))}
                  />
                </td>
                {gstApplied ? (
                  <td className="px-2 py-1.5">
                    <select
                      className={selectClass}
                      value={line.gstRatePct ?? defaultRate}
                      onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, gstRatePct: Number(e.target.value) } : l)))}
                    >
                      {taxRates.map((r) => (
                        <option key={r} value={r}>
                          {r}%
                        </option>
                      ))}
                    </select>
                  </td>
                ) : null}
                <td className="px-2 py-1.5 text-center">
                  {lines.length > 1 ? (
                    <button
                      type="button"
                      className="text-xs text-red-700 hover:text-red-800 font-medium px-1"
                      onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                    >
                      Remove
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {lines.map((line, idx) => (
          <div key={idx} className="grid gap-2 p-3 rounded-lg border border-stone-200 bg-stone-50/90 text-sm grid-cols-2">
            <input
              className={`${input} col-span-2`}
              placeholder="Item description *"
              value={line.description}
              onChange={(e) => {
                setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, description: e.target.value } : l)));
                setFieldErrors((fe) => ({ ...fe, lines: undefined }));
              }}
            />
            {gstApplied ? (
              <input
                className={input}
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
            <input
              className={input}
              placeholder="Unit"
              value={line.unit ?? 'nos'}
              onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, unit: e.target.value } : l)))}
            />
            <input
              type="number"
              min={0}
              className={input}
              placeholder="Rate ₹"
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
              <select
                className={`${selectClass} col-span-2`}
                value={line.gstRatePct ?? defaultRate}
                onChange={(e) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, gstRatePct: Number(e.target.value) } : l)))}
              >
                {taxRates.map((r) => (
                  <option key={r} value={r}>
                    GST {r}%
                  </option>
                ))}
              </select>
            ) : null}
            {lines.length > 1 ? (
              <button
                type="button"
                className="col-span-2 text-left text-xs text-red-700 font-medium py-1"
                onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
              >
                Remove item
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {fieldErrors.lines ? (
        <p className="text-xs text-red-600 mt-2" role="alert">
          {fieldErrors.lines}
        </p>
      ) : null}
    </BillingFormSection>
  );

  const gstSection = (
    <BillingFormSection step={4} title="GST and adjustments" subtitle="Toggle tax invoice mode for this bill" icon={Receipt}>
      <label className="flex items-start gap-3 text-sm cursor-pointer text-stone-800">
        <input
          type="checkbox"
          checked={gstApplied}
          onChange={(e) => setGstApplied(e.target.checked)}
          className="mt-0.5 rounded border-stone-400 text-amber-700 focus:ring-amber-600/30"
        />
        <span>
          <span className="font-medium">Apply GST on this invoice</span>
          <span className={clsx(hintClass, 'block mt-1')}>
            {gstApplied
              ? 'Tax split follows seller and customer state. GSTIN is required on issue for tax invoices.'
              : 'Non-GST bill — no tax break-up on the printout.'}
          </span>
        </span>
      </label>
    </BillingFormSection>
  );

  const notesSection = (
    <BillingFormSection title="Notes" subtitle="Optional message on the printed invoice" icon={StickyNote}>
      <label className={labelClass}>
        Invoice notes
        <textarea
          className={`${input} mt-0.5`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Shown on the invoice when filled"
        />
      </label>
    </BillingFormSection>
  );

  const summaryAside = (
    <div className="space-y-4 lg:sticky lg:top-4">
      <InvoiceSummaryCard
        totalsLoading={totalsLoading}
        totals={totals}
        gstApplied={gstApplied}
        taxableInr={taxableInr}
        amountPaid={amountPaid}
        balanceDue={balanceDue}
      />
      {mode === 'create' ? (
        <BillingFormSection step={6} title="Preview and save" subtitle="Preview opens in a new tab without saving">
          <div className="flex flex-col gap-2">
            <AdminBtnSecondary type="button" disabled={previewBusy || saveMut.isPending} onClick={() => handlePreview()} className="w-full justify-center">
              {previewBusy ? 'Opening preview…' : 'Preview Invoice'}
            </AdminBtnSecondary>
            <AdminBtnSecondary type="button" disabled={saveMut.isPending} onClick={doSaveDraft} className="w-full justify-center">
              Save Draft
            </AdminBtnSecondary>
            <AdminBtnPrimary
              type="button"
              disabled={saveMut.isPending}
              onClick={doIssue}
              className="w-full justify-center !bg-amber-800 hover:!bg-amber-900"
            >
              Save & Issue Invoice
            </AdminBtnPrimary>
          </div>
        </BillingFormSection>
      ) : null}
    </div>
  );

  const editActions = (
    <BillingFormSection step={6} title="Preview and save">
      <div className="flex flex-col-reverse sm:flex-row flex-wrap gap-2 sm:justify-end">
        <AdminBtnSecondary type="button" onClick={() => router.push('/billing')} disabled={saveMut.isPending}>
          Cancel
        </AdminBtnSecondary>
        <AdminBtnSecondary type="button" disabled={previewBusy || saveMut.isPending} onClick={() => handlePreview()}>
          {previewBusy ? 'Opening preview…' : 'Preview Invoice'}
        </AdminBtnSecondary>
        {isDraftEdit ? (
          <>
            <AdminBtnSecondary type="button" disabled={saveMut.isPending} onClick={doSaveDraft}>
              Save changes
            </AdminBtnSecondary>
            <AdminBtnPrimary type="button" disabled={saveMut.isPending} onClick={doIssue} className="!bg-amber-800 hover:!bg-amber-900">
              Save & Issue Invoice
            </AdminBtnPrimary>
          </>
        ) : (
          <AdminBtnPrimary type="button" disabled={saveMut.isPending || !customerId} onClick={doSaveDraft}>
            Update invoice
          </AdminBtnPrimary>
        )}
      </div>
    </BillingFormSection>
  );

  if (mode === 'create') {
    return (
      <div className="w-full max-w-none billing-create-invoice">
        <CreateInvoiceHeader
          statusLabel={isDirty ? 'Unsaved changes' : 'New draft'}
          statusTone={isDirty ? 'unsaved' : 'draft'}
          previewBusy={previewBusy}
          savePending={saveMut.isPending}
          onPreview={() => handlePreview()}
          onSaveDraft={doSaveDraft}
          onIssue={doIssue}
          onReset={handleReset}
          showReset
        />
        {alerts}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
          <div className="space-y-4 min-w-0">
            {invoiceDetails}
            {customerSection}
            {itemsSection}
            {gstSection}
            {notesSection}
          </div>
          {summaryAside}
        </div>
        <div className="fixed bottom-0 inset-x-0 z-20 border-t border-stone-200 bg-white/95 backdrop-blur p-3 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex gap-2 max-w-lg mx-auto">
            <AdminBtnSecondary type="button" className="flex-1 !py-2.5" disabled={previewBusy || saveMut.isPending} onClick={() => handlePreview()}>
              Preview
            </AdminBtnSecondary>
            <AdminBtnPrimary type="button" className="flex-1 !py-2.5 !bg-amber-800" disabled={saveMut.isPending} onClick={doIssue}>
              Issue
            </AdminBtnPrimary>
          </div>
        </div>
        <div className="h-20 lg:hidden" aria-hidden />
      </div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-4">
      {alerts}
      {invoiceDetails}
      {customerSection}
      {itemsSection}
      {gstSection}
      <InvoiceSummaryCard
        totalsLoading={totalsLoading}
        totals={totals}
        gstApplied={gstApplied}
        taxableInr={taxableInr}
        amountPaid={amountPaid}
        balanceDue={balanceDue}
      />
      {notesSection}
      {editActions}
    </div>
  );
}
