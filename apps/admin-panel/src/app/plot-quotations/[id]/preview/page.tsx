'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { PlotQuotationDocument } from '@/components/admin/PlotQuotationDocument';

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
      <div className="no-print print:hidden max-w-3xl mx-auto p-4 space-y-3">
        <Link href="/plots" className="text-sm text-blue-700 hover:underline">
          ← Plots
        </Link>
        <div className="flex flex-wrap gap-2">
          <AdminBtnSecondary type="button" onClick={() => window.print()}>
            <span className="inline-flex items-center gap-2">
              <Printer className="h-4 w-4" aria-hidden />
              Print A4
            </span>
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

      <PlotQuotationDocument
        projectName={data.plot.project?.name ?? 'JK Nagar'}
        plotNumber={data.plot.plotNumber}
        areaSqft={data.plot.areaSqft}
        pricePerSqftInr={data.pricePerSqftInr}
        basePlotPriceInr={data.basePlotPriceInr}
        additionalTotalInr={data.additionalTotalInr}
        estimatedTotalInr={data.estimatedTotalInr}
        validUntil={data.validUntil}
        documentDate={today}
        customer={data.customer}
        broker={data.broker}
        commissionExpectedInr={data.commissionExpectedInr}
        commissionPaidBy={data.commissionPaidBy}
        charges={data.charges}
        notes={data.notes}
        terms={data.terms}
      />
    </>
  );
}
