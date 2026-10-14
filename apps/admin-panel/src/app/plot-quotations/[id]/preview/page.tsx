'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { formatInr, formatSqft } from '@/lib/plot-currency';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';

type Q = {
  id: string;
  status: string;
  pricePerSqftInr: string;
  basePlotPriceInr: string;
  additionalTotalInr: string;
  estimatedTotalInr: string;
  commissionExpectedInr: string | null;
  commissionPaidBy: string | null;
  validUntil: string | null;
  notes: string | null;
  terms: string | null;
  plot: { plotNumber: string; areaSqft: string | null; project: { name: string } | null };
  customer: { name: string; phone: string; email: string | null; address: string | null };
  broker: { name: string; phone: string } | null;
  charges: Array<{ label: string; amountInr: string }>;
};

export default function PlotQuotationPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ['plot-quotation', id],
    queryFn: () => adminFetch<Q>(`/erp/plot-quotations/${id}`),
  });

  const reserve = useMutation({
    mutationFn: () => adminFetch(`/erp/plot-quotations/${id}/reserve`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plot-quotation', id] });
      qc.invalidateQueries({ queryKey: ['erp-plots'] });
    },
  });

  const sold = useMutation({
    mutationFn: () => adminFetch(`/erp/plot-quotations/${id}/mark-sold`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plot-quotation', id] });
      qc.invalidateQueries({ queryKey: ['erp-plots'] });
    },
  });

  if (q.isLoading || !q.data) return <p className="p-8 text-sm">Loading quotation…</p>;
  const data = q.data;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div className="print:hidden max-w-3xl mx-auto p-4 space-y-3">
        <Link href={`/projects/${data.plot.project ? '' : ''}`} className="text-sm text-blue-700 hover:underline">
          ← Back
        </Link>
        <div className="flex flex-wrap gap-2">
          <AdminBtnSecondary type="button" onClick={() => window.print()}>
            Print A4
          </AdminBtnSecondary>
          <AdminBtnSecondary type="button" disabled={reserve.isPending} onClick={() => reserve.mutate()}>
            Record reservation
          </AdminBtnSecondary>
          <AdminBtnPrimary type="button" disabled={sold.isPending} onClick={() => sold.mutate()}>
            Mark plot sold
          </AdminBtnPrimary>
        </div>
        {(reserve.error || sold.error) && (
          <p className="text-sm text-red-600">{(reserve.error ?? sold.error)?.message}</p>
        )}
      </div>

      <article className="mx-auto max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 md:p-12 shadow print:shadow-none print:p-12">
        <header className="border-b pb-4 mb-6">
          <p className="text-xs uppercase tracking-wide text-slate-500">Quotation — not a sale deed</p>
          <h1 className="text-2xl font-bold mt-1">{data.plot.project?.name ?? 'JK Nagar'}</h1>
          <p className="text-sm text-slate-600 mt-1">Date: {today}</p>
          {data.validUntil ? <p className="text-sm text-slate-600">Valid until: {data.validUntil.slice(0, 10)}</p> : null}
        </header>

        <section className="grid sm:grid-cols-2 gap-6 text-sm mb-8">
          <div>
            <h2 className="font-semibold text-slate-700">Customer</h2>
            <p className="mt-1">{data.customer.name}</p>
            <p>{data.customer.phone}</p>
            {data.customer.email ? <p>{data.customer.email}</p> : null}
            {data.customer.address ? <p className="whitespace-pre-line">{data.customer.address}</p> : null}
          </div>
          <div>
            <h2 className="font-semibold text-slate-700">Plot</h2>
            <p className="mt-1">Plot no. {data.plot.plotNumber}</p>
            <p>Area: {formatSqft(data.plot.areaSqft)} sq ft</p>
            <p>Rate: {formatInr(data.pricePerSqftInr)} / sq ft</p>
          </div>
        </section>

        <table className="w-full text-sm mb-6">
          <tbody>
            <tr className="border-b">
              <td className="py-2">Base plot price</td>
              <td className="py-2 text-right tabular-nums">{formatInr(data.basePlotPriceInr)}</td>
            </tr>
            {data.charges.map((c) => (
              <tr key={c.label} className="border-b">
                <td className="py-2">{c.label}</td>
                <td className="py-2 text-right tabular-nums">{formatInr(c.amountInr)}</td>
              </tr>
            ))}
            <tr className="font-bold text-base">
              <td className="py-3">Estimated total payable</td>
              <td className="py-3 text-right tabular-nums">{formatInr(data.estimatedTotalInr)}</td>
            </tr>
          </tbody>
        </table>

        {data.broker ? (
          <section className="text-sm mb-6 rounded-lg border p-3 bg-slate-50">
            <h2 className="font-semibold">Broker</h2>
            <p>
              {data.broker.name} · {data.broker.phone}
            </p>
            {data.commissionExpectedInr ? (
              <p>
                Commission: {formatInr(data.commissionExpectedInr)} ({data.commissionPaidBy === 'BUYER' ? 'buyer' : 'seller'} side)
              </p>
            ) : null}
          </section>
        ) : null}

        {data.notes ? <p className="text-sm mb-4">{data.notes}</p> : null}
        <p className="text-xs text-slate-600 border-t pt-4">{data.terms ?? 'Figures are estimates until verified with registration authorities.'}</p>
      </article>
    </>
  );
}
