'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, AdminBtnSecondary } from '@/components/admin/AdminForm';
import { PlotHoldDialog } from '@/components/admin/PlotHoldDialog';
import { clsx } from 'clsx';
import { useState } from 'react';
import { formatInr, formatSqft } from '@/lib/plot-currency';

type PlotEvent = { id: string; action: string; detail: string | null; createdAt: string };

type Plot = {
  id: string;
  plotNumber: string;
  surveyNumber: string | null;
  status: string;
  facing: string | null;
  areaSqft: string | null;
  lengthFt: string | null;
  widthFt: string | null;
  description: string | null;
  archived: boolean;
  priceInr: string | null;
  pricePerSqftInr?: string | null;
  project: { id: string; name: string } | null;
  customer: { id: string; name: string; phone?: string } | null;
  broker?: { id: string; name: string; phone?: string; code?: string | null } | null;
  events?: PlotEvent[];
  holdInfo?: {
    activeQuotationReservation: boolean;
    manualHold: { holdUntil?: string; notes?: string; reason?: string } | null;
    manualHoldReleased: boolean;
  };
};

function statusTone(status: string) {
  if (status === 'AVAILABLE') return 'bg-emerald-100 text-emerald-900';
  if (status === 'RESERVED') return 'bg-amber-100 text-amber-900';
  if (status === 'SOLD') return 'bg-slate-200 text-slate-800';
  return 'bg-red-100 text-red-900';
}

export default function PlotViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['erp-plot', id],
    queryFn: () => adminFetch<Plot>(`/erp/plots/${id}`),
  });

  const releaseHold = useMutation({
    mutationFn: () => adminFetch(`/erp/plots/${id}/release-hold`, { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp-plot', id] });
      qc.invalidateQueries({ queryKey: ['erp-plots'] });
      setMessage('Hold released — plot is available again.');
    },
    onError: (err: Error) => setMessage(err.message),
  });

  const del = useMutation({
    mutationFn: () => adminFetch<{ archived?: boolean }>(`/erp/plots/${id}`, { method: 'DELETE' }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['erp-plots'] });
      qc.invalidateQueries({ queryKey: ['erp-plots-summary'] });
      if (result.archived) {
        setMessage('Plot archived.');
        setConfirmDelete(false);
        qc.invalidateQueries({ queryKey: ['erp-plot', id] });
        return;
      }
      router.push('/plots');
    },
    onError: (err: Error) => setMessage(err.message),
  });

  if (isLoading || !data) return <div className="p-8 text-sm opacity-60">Loading…</div>;

  const dimensions =
    data.lengthFt && data.widthFt ? `${Number(data.lengthFt)} × ${Number(data.widthFt)} ft` : '—';

  const canHold = data.status === 'AVAILABLE' && !data.archived;
  const canRelease =
    data.status === 'RESERVED' && !data.holdInfo?.activeQuotationReservation && !data.archived;

  return (
    <AdminPanel
      title={`Plot ${data.plotNumber}`}
      actions={
        <div className="flex flex-wrap gap-2">
          {canHold ? (
            <AdminBtnSecondary type="button" onClick={() => setHoldOpen(true)}>
              Hold plot
            </AdminBtnSecondary>
          ) : null}
          {canRelease ? (
            <AdminBtnPrimary type="button" disabled={releaseHold.isPending} onClick={() => releaseHold.mutate()}>
              Release hold
            </AdminBtnPrimary>
          ) : null}
          <Link href={`/plots/${id}/edit`} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Edit
          </Link>
          <AdminBtnSecondary onClick={() => setConfirmDelete(true)}>Delete</AdminBtnSecondary>
        </div>
      }
    >
      {message ? <p className="px-6 pt-4 text-sm text-emerald-800">{message}</p> : null}

      {data.holdInfo?.activeQuotationReservation ? (
        <p className="mx-6 mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900">
          This plot is reserved via an active quotation. Release or complete that workflow before clearing the hold here.
        </p>
      ) : null}

      <dl className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div>
          <dt className="text-xs opacity-60">Project</dt>
          <dd className="font-semibold">
            {data.project ? (
              <Link href={`/projects/${data.project.id}/plots`} className="text-blue-700 hover:underline">
                {data.project.name}
              </Link>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Status</dt>
          <dd>
            <span className={clsx('rounded px-2 py-0.5 text-xs font-semibold', statusTone(data.status))}>{data.status}</span>
          </dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Area (sq ft)</dt>
          <dd className="font-semibold tabular-nums">{data.areaSqft ? formatSqft(data.areaSqft) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Dimensions</dt>
          <dd className="font-semibold">{dimensions}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Rate / base price</dt>
          <dd className="font-semibold tabular-nums">
            {data.pricePerSqftInr ? `${formatInr(data.pricePerSqftInr)}/sq ft` : '—'}
            {data.priceInr ? <span className="block text-xs font-normal">Base: {formatInr(data.priceInr)}</span> : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Survey / facing</dt>
          <dd className="font-semibold">
            {data.surveyNumber ?? '—'} · {data.facing ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Customer (hold / sale)</dt>
          <dd className="font-semibold">{data.customer?.name ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Broker</dt>
          <dd className="font-semibold">
            {data.broker ? (
              <Link href={`/brokers/${data.broker.id}`} className="text-blue-700 hover:underline">
                {data.broker.name}
              </Link>
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs opacity-60">Archived</dt>
          <dd className="font-semibold">{data.archived ? 'Yes' : 'No'}</dd>
        </div>
        {data.holdInfo?.manualHold ? (
          <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs">
            <p className="font-semibold text-amber-900">Manual hold details</p>
            {data.holdInfo.manualHold.holdUntil ? <p>Until: {data.holdInfo.manualHold.holdUntil.slice(0, 10)}</p> : null}
            {data.holdInfo.manualHold.reason ? <p>Reason: {data.holdInfo.manualHold.reason}</p> : null}
            {data.holdInfo.manualHold.notes ? <p>Notes: {data.holdInfo.manualHold.notes}</p> : null}
          </div>
        ) : null}
        {data.description ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-xs opacity-60">Description</dt>
            <dd className="mt-1 font-medium leading-relaxed">{data.description}</dd>
          </div>
        ) : null}
      </dl>

      {(data.events?.length ?? 0) > 0 ? (
        <section className="border-t px-6 py-4 text-xs">
          <h2 className="font-semibold mb-2">Recent activity</h2>
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {data.events!.map((ev) => (
              <li key={ev.id} className="text-slate-600">
                <span className="font-mono text-slate-800">{ev.action}</span>
                {ev.detail ? ` — ${ev.detail.length > 120 ? `${ev.detail.slice(0, 120)}…` : ev.detail}` : null}
                <span className="text-slate-400 ml-2">{new Date(ev.createdAt).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PlotHoldDialog
        plotId={data.id}
        plotNumber={data.plotNumber}
        open={holdOpen}
        onClose={() => setHoldOpen(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['erp-plot', id] });
          qc.invalidateQueries({ queryKey: ['erp-plots'] });
          setMessage('Plot placed on hold.');
          setHoldOpen(false);
        }}
      />

      {confirmDelete ? (
        <div className="border-t px-6 py-4 text-sm">
          <p className="font-semibold">Remove plot {data.plotNumber} from {data.project?.name ?? 'this project'}?</p>
          <p className="mt-1 text-slate-600">Reserved or sold plots are archived to keep history.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="rounded-lg bg-red-700 px-3 py-2 font-semibold text-white" disabled={del.isPending} onClick={() => del.mutate()}>
              Confirm
            </button>
            <button type="button" className="rounded-lg border px-3 py-2" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </AdminPanel>
  );
}
