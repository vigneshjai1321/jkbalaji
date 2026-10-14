'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { adminFetch } from '@/lib/admin-api';
import { formatInr, formatSqft, computeBaseFromRate } from '@/lib/plot-currency';
import { AdminBtnPrimary, AdminBtnSecondary, useAdminInputClass } from '@/components/admin/AdminForm';

type PlotOption = {
  id: string;
  plotNumber: string;
  areaSqft: string | null;
  status: string;
  pricePerSqftInr?: string | null;
};

type Customer = { id: string; name: string; phone: string };
type Broker = { id: string; name: string; phone: string };

type ChargeRow = {
  label: string;
  kind: 'FIXED' | 'PERCENT';
  fixedAmountInr: string;
  percentRate: string;
};

type PreviewTotals = {
  basePlotPriceInr: number;
  additionalTotalInr: number;
  estimatedTotalInr: number;
  commissionExpectedInr: number | null;
  chargeLines: Array<{ label: string; amountInr: number }>;
};

const DEFAULT_CHARGES: ChargeRow[] = [
  { label: 'Registration cost', kind: 'FIXED', fixedAmountInr: '', percentRate: '' },
  { label: 'Stamp duty', kind: 'PERCENT', fixedAmountInr: '', percentRate: '' },
  { label: 'Documentation charges', kind: 'FIXED', fixedAmountInr: '', percentRate: '' },
];

export function PlotQuotationForm({ projectId, projectName, initialPlotId }: { projectId: string; projectName: string; initialPlotId?: string }) {
  const input = useAdminInputClass();
  const router = useRouter();
  const [plotId, setPlotId] = useState(initialPlotId ?? '');
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerLabel, setCustomerLabel] = useState('');
  const [rate, setRate] = useState('');
  const [charges, setCharges] = useState<ChargeRow[]>(DEFAULT_CHARGES);
  const [showCosts, setShowCosts] = useState(false);
  const [brokerId, setBrokerId] = useState('');
  const [commissionKind, setCommissionKind] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [commissionRate, setCommissionRate] = useState('');
  const [commissionPaidBy, setCommissionPaidBy] = useState<'SELLER' | 'BUYER'>('SELLER');
  const [includeCommissionInTotal, setIncludeCommissionInTotal] = useState(false);
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('Estimate only — registration and stamp duty must be verified before payment.');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<PreviewTotals | null>(null);

  const plots = useQuery({
    queryKey: ['erp-plots', projectId],
    queryFn: () => adminFetch<PlotOption[]>(`/erp/plots?projectId=${projectId}&status=AVAILABLE`),
  });

  const plot = (plots.data ?? []).find((p) => p.id === plotId);
  const area = plot?.areaSqft ? Number(plot.areaSqft) : null;
  const liveBase = area && rate ? computeBaseFromRate(area, Number(rate)) : null;

  useEffect(() => {
    if (plot?.pricePerSqftInr && !rate) setRate(String(plot.pricePerSqftInr));
  }, [plot, rate]);

  const customers = useQuery({
    queryKey: ['billing-customer-search', customerQuery],
    queryFn: () => adminFetch<Customer[]>(`/billing/customers?q=${encodeURIComponent(customerQuery)}&limit=15`),
    enabled: customerQuery.trim().length >= 1,
  });

  const brokers = useQuery({
    queryKey: ['erp-brokers'],
    queryFn: () => adminFetch<Broker[]>('/erp/brokers'),
  });

  const chargePayload = useMemo(
    () =>
      charges
        .filter((c) => c.label.trim())
        .map((c) =>
          c.kind === 'FIXED'
            ? { label: c.label.trim(), kind: 'FIXED' as const, fixedAmountInr: c.fixedAmountInr ? Number(c.fixedAmountInr) : 0 }
            : {
                label: c.label.trim(),
                kind: 'PERCENT' as const,
                percentRate: c.percentRate ? Number(c.percentRate) : 0,
                percentBase: 'BASE_PLOT' as const,
              },
        ),
    [charges],
  );

  useEffect(() => {
    if (!plotId || !rate) {
      setPreview(null);
      return;
    }
    const handle = setTimeout(() => {
      adminFetch<PreviewTotals>('/erp/plot-quotations/preview', {
        method: 'POST',
        body: JSON.stringify({
          plotId,
          pricePerSqftInr: Number(rate),
          charges: chargePayload,
          broker: brokerId
            ? {
                kind: commissionKind,
                rate: Number(commissionRate || 0),
                paidBy: commissionPaidBy,
                includeInTotal: includeCommissionInTotal,
              }
            : undefined,
        }),
      })
        .then(setPreview)
        .catch(() => setPreview(null));
    }, 400);
    return () => clearTimeout(handle);
  }, [plotId, rate, chargePayload, brokerId, commissionKind, commissionRate, commissionPaidBy, includeCommissionInTotal]);

  const save = useMutation({
    mutationFn: (status: 'DRAFT' | 'QUOTED') =>
      adminFetch<{ id: string }>('/erp/plot-quotations', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          plotId,
          customerId,
          pricePerSqftInr: Number(rate),
          charges: chargePayload,
          status,
          brokerId: brokerId || undefined,
          broker: brokerId
            ? {
                kind: commissionKind,
                rate: Number(commissionRate || 0),
                paidBy: commissionPaidBy,
                includeInTotal: includeCommissionInTotal,
              }
            : undefined,
          validUntil: validUntil || undefined,
          notes: notes || undefined,
          terms,
        }),
      }),
    onSuccess: (row) => router.push(`/plot-quotations/${row.id}/preview`),
    onError: (e: Error) => setError(e.message),
  });

  return (
    <div className="max-w-3xl space-y-5 text-sm">
      <p className="text-slate-600">
        {projectName} — prepare a quotation estimate. Saving does not mark the plot sold.
      </p>
      {error ? <p className="text-red-600">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="font-semibold">1. Plot</h2>
        <select className={input} value={plotId} onChange={(e) => setPlotId(e.target.value)} required>
          <option value="">Select available plot</option>
          {(plots.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.plotNumber} — {formatSqft(p.areaSqft)} sq ft
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">2. Customer</h2>
        {customerId ? (
          <p>
            {customerLabel}{' '}
            <button type="button" className="text-blue-600 underline" onClick={() => { setCustomerId(''); setCustomerLabel(''); }}>
              Change
            </button>
          </p>
        ) : (
          <>
            <input className={input} placeholder="Search name or phone" value={customerQuery} onChange={(e) => setCustomerQuery(e.target.value)} />
            <ul className="border rounded-lg divide-y max-h-40 overflow-y-auto">
              {(customers.data ?? []).map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-slate-50"
                    onClick={() => {
                      setCustomerId(c.id);
                      setCustomerLabel(`${c.name} · ${c.phone}`);
                      setCustomerQuery('');
                    }}
                  >
                    {c.name} · {c.phone}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">3. Price per sq ft</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <label>
            Rate (₹ / sq ft)
            <input type="number" min={0} className={`${input} mt-1`} value={rate} onChange={(e) => setRate(e.target.value)} required />
          </label>
          <div className="rounded-lg border p-3 bg-slate-50">
            <p className="text-xs text-slate-500">Base plot price</p>
            <p className="text-lg font-semibold tabular-nums">{liveBase != null ? formatInr(liveBase) : '—'}</p>
            {area ? <p className="text-xs text-slate-500">{formatSqft(area)} sq ft × {rate || '…'}</p> : null}
          </div>
        </div>
      </section>

      <section>
        <button type="button" className="font-semibold text-blue-700" onClick={() => setShowCosts((v) => !v)}>
          {showCosts ? '▼' : '▶'} Additional costs (optional estimate)
        </button>
        {showCosts ? (
          <div className="mt-3 space-y-2">
            {charges.map((c, idx) => (
              <div key={idx} className="grid sm:grid-cols-4 gap-2 items-end">
                <input className={`${input} sm:col-span-2`} value={c.label} onChange={(e) => setCharges((rows) => rows.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)))} />
                <select className={input} value={c.kind} onChange={(e) => setCharges((rows) => rows.map((r, i) => (i === idx ? { ...r, kind: e.target.value as ChargeRow['kind'] } : r)))}>
                  <option value="FIXED">Fixed ₹</option>
                  <option value="PERCENT">% of base</option>
                </select>
                {c.kind === 'FIXED' ? (
                  <input type="number" min={0} className={input} placeholder="Amount" value={c.fixedAmountInr} onChange={(e) => setCharges((rows) => rows.map((r, i) => (i === idx ? { ...r, fixedAmountInr: e.target.value } : r)))} />
                ) : (
                  <input type="number" min={0} className={input} placeholder="%" value={c.percentRate} onChange={(e) => setCharges((rows) => rows.map((r, i) => (i === idx ? { ...r, percentRate: e.target.value } : r)))} />
                )}
              </div>
            ))}
            <AdminBtnSecondary type="button" className="!text-xs" onClick={() => setCharges((r) => [...r, { label: 'Other charge', kind: 'FIXED', fixedAmountInr: '', percentRate: '' }])}>
              + Add charge
            </AdminBtnSecondary>
          </div>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">Broker (optional)</h2>
        <select className={input} value={brokerId} onChange={(e) => setBrokerId(e.target.value)}>
          <option value="">No broker</option>
          {(brokers.data ?? []).map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} · {b.phone}
            </option>
          ))}
        </select>
        {brokerId ? (
          <div className="grid sm:grid-cols-3 gap-2">
            <select className={input} value={commissionKind} onChange={(e) => setCommissionKind(e.target.value as typeof commissionKind)}>
              <option value="PERCENTAGE">% of base price</option>
              <option value="FIXED">Fixed amount</option>
            </select>
            <input type="number" min={0} className={input} placeholder="Rate" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} />
            <select className={input} value={commissionPaidBy} onChange={(e) => setCommissionPaidBy(e.target.value as typeof commissionPaidBy)}>
              <option value="SELLER">Paid by seller</option>
              <option value="BUYER">Paid by buyer</option>
            </select>
            {commissionPaidBy === 'BUYER' ? (
              <label className="sm:col-span-3 flex items-center gap-2">
                <input type="checkbox" checked={includeCommissionInTotal} onChange={(e) => setIncludeCommissionInTotal(e.target.checked)} />
                Include commission in buyer&apos;s estimated total
              </label>
            ) : null}
          </div>
        ) : null}
      </section>

      {preview ? (
        <section className="rounded-xl border p-4 bg-white space-y-1">
          <h2 className="font-semibold mb-2">Breakdown</h2>
          <Row label="Base plot price" value={preview.basePlotPriceInr} />
          {preview.chargeLines.map((c) => (
            <Row key={c.label} label={c.label} value={c.amountInr} />
          ))}
          {preview.commissionExpectedInr != null ? (
            <Row label="Broker commission (info)" value={preview.commissionExpectedInr} muted />
          ) : null}
          <Row label="Estimated total payable" value={preview.estimatedTotalInr} strong />
          <label className="block text-xs text-amber-700 pt-2">
            Terms (shown on quotation)
            <textarea className={`${input} mt-1 text-slate-800`} rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} />
          </label>
        </section>
      ) : null}

      <section className="grid sm:grid-cols-2 gap-3">
        <label>
          Valid until
          <input type="date" className={`${input} mt-1`} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </label>
        <label className="sm:col-span-2">
          Notes
          <textarea className={`${input} mt-1`} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
      </section>

      <div className="flex flex-wrap gap-2 pt-2">
        <AdminBtnSecondary type="button" disabled={save.isPending || !plotId || !customerId || !rate} onClick={() => save.mutate('DRAFT')}>
          Save draft quotation
        </AdminBtnSecondary>
        <AdminBtnPrimary type="button" disabled={save.isPending || !plotId || !customerId || !rate} onClick={() => save.mutate('QUOTED')}>
          Save & preview
        </AdminBtnPrimary>
      </div>
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: number; strong?: boolean; muted?: boolean }) {
  return (
    <div className={clsx('flex justify-between gap-4 tabular-nums', strong && 'font-semibold text-base border-t pt-2', muted && 'text-slate-500 text-xs')}>
      <span>{label}</span>
      <span>{formatInr(value)}</span>
    </div>
  );
}
