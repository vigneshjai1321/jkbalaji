'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { formatInr, formatRate } from '@/lib/format-inr';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { canWriteCommission } from '@/lib/admin-permissions';

type Payment = {
  id: string;
  amountInr: string;
  paidAt: string;
  method: string | null;
  reference: string | null;
  notes: string | null;
  reversedAt: string | null;
  recordedBy: { name: string } | null;
};

type Detail = {
  id: string;
  kind: string;
  rate: string;
  rateSource: string;
  calculationBasis: string;
  calculationLabel: string;
  saleValueInr: string | null;
  expectedInr: string;
  paidInr: string;
  outstandingInr: number;
  status: string;
  notes: string | null;
  createdAt: string;
  broker: { name: string; phone: string; email: string | null };
  project: { name: string } | null;
  plot: { plotNumber: string; areaSqft: string | null; pricePerSqftInr: string | null } | null;
  plotQuotation: { id: string; status: string } | null;
  payments: Payment[];
};

export default function CommissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminAuth();
  const canPay = canWriteCommission(user?.role);
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const [paidAt, setPaidAt] = useState('');
  const [reference, setReference] = useState('');
  const [method, setMethod] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['commission', id],
    queryFn: () => adminFetch<Detail>(`/commissions/${id}`),
  });

  const pay = useMutation({
    mutationFn: () =>
      adminFetch(`/commissions/${id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amountInr: Number(amount),
          paidAt: paidAt || undefined,
          reference: reference || undefined,
          method: method || undefined,
        }),
      }),
    onSuccess: () => {
      setMsg('Payment recorded successfully.');
      setAmount('');
      void qc.invalidateQueries({ queryKey: ['commission', id] });
      void qc.invalidateQueries({ queryKey: ['commissions'] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const row = detail.data;
  if (detail.isLoading) return <p className="p-6 text-sm text-slate-500">Loading…</p>;
  if (!row) return <p className="p-6 text-sm text-red-600">Commission not found.</p>;

  return (
    <AdminPanel
      title="Commission details"
      actions={
        <Link href="/commissions" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Back
        </Link>
      }
    >
      <div className="p-6 grid lg:grid-cols-2 gap-8 text-sm">
        <section className="space-y-3">
          <h2 className="font-semibold text-base">Summary</h2>
          <dl className="grid grid-cols-2 gap-2">
            <dt className="text-slate-500">Broker</dt>
            <dd>{row.broker.name}</dd>
            <dt className="text-slate-500">Project</dt>
            <dd>{row.project?.name ?? '—'}</dd>
            <dt className="text-slate-500">Plot</dt>
            <dd>{row.plot?.plotNumber ?? '—'}</dd>
            <dt className="text-slate-500">Quotation</dt>
            <dd>{row.plotQuotation?.id.slice(0, 10) ?? '—'} ({row.plotQuotation?.status ?? '—'})</dd>
            <dt className="text-slate-500">Calculation basis</dt>
            <dd>{row.calculationLabel}</dd>
            <dt className="text-slate-500">Eligible plot value</dt>
            <dd>{formatInr(row.saleValueInr)}</dd>
            <dt className="text-slate-500">Saved rate</dt>
            <dd>
              {formatRate(row.kind, row.rate)} ({row.rateSource})
            </dd>
            <dt className="text-slate-500">Commission amount</dt>
            <dd className="font-semibold">{formatInr(row.expectedInr)}</dd>
            <dt className="text-slate-500">Amount paid</dt>
            <dd>{formatInr(row.paidInr)}</dd>
            <dt className="text-slate-500">Outstanding</dt>
            <dd className="font-semibold text-amber-800">{formatInr(row.outstandingInr)}</dd>
            <dt className="text-slate-500">Status</dt>
            <dd>{row.status}</dd>
          </dl>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold text-base">Payment history</h2>
          <ul className="divide-y border rounded-xl">
            {row.payments.length === 0 ? (
              <li className="p-4 text-slate-500">No payments yet.</li>
            ) : (
              row.payments.map((p) => (
                <li key={p.id} className="p-4 flex justify-between gap-4">
                  <div>
                    <p className="font-medium">{formatInr(p.amountInr)}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(p.paidAt).toLocaleDateString('en-IN')}
                      {p.reference ? ` · Ref ${p.reference}` : ''}
                      {p.method ? ` · ${p.method}` : ''}
                      {p.reversedAt ? ' · Reversed' : ''}
                    </p>
                  </div>
                  <span className="text-xs text-slate-500">{p.recordedBy?.name ?? ''}</span>
                </li>
              ))
            )}
          </ul>

          {canPay && row.outstandingInr > 0 ? (
            <form
              className="rounded-xl border p-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setMsg(null);
                pay.mutate();
              }}
            >
              <p className="font-medium">Record payment</p>
              <input
                required
                type="number"
                min={0.01}
                step="0.01"
                placeholder="Amount (INR)"
                className="w-full rounded-lg border px-3 py-2"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <input type="date" className="w-full rounded-lg border px-3 py-2" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
              <input
                placeholder="Payment method"
                className="w-full rounded-lg border px-3 py-2"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              />
              <input
                placeholder="Reference number"
                className="w-full rounded-lg border px-3 py-2"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <button
                type="submit"
                disabled={pay.isPending}
                className="rounded-lg bg-emerald-700 text-white px-4 py-2 font-semibold disabled:opacity-60"
              >
                Record payment
              </button>
              {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
            </form>
          ) : null}
        </section>
      </div>
    </AdminPanel>
  );
}
