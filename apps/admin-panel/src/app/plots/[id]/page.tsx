'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';
import { useState } from 'react';

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
  project: { id: string; name: string } | null;
  customer: { name: string } | null;
};

export default function PlotViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['erp-plot', id],
    queryFn: () => adminFetch<Plot>(`/erp/plots/${id}`),
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

  return (
    <AdminPanel
      title={`Plot ${data.plotNumber}`}
      actions={
        <div className="flex gap-2">
          <Link href={`/plots/${id}/edit`} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Edit
          </Link>
          <AdminBtnSecondary onClick={() => setConfirmDelete(true)}>Delete</AdminBtnSecondary>
        </div>
      }
    >
      {message ? <p className="px-6 pt-4 text-sm text-emerald-800">{message}</p> : null}
      <dl className="grid gap-4 p-6 sm:grid-cols-2 text-sm">
        <div>
          <dt className="opacity-60">Project</dt>
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
          <dt className="opacity-60">Status</dt>
          <dd className="font-semibold">{data.status}</dd>
        </div>
        <div>
          <dt className="opacity-60">Area (sq ft)</dt>
          <dd className="font-semibold">{data.areaSqft ? Number(data.areaSqft).toLocaleString('en-IN') : '—'}</dd>
        </div>
        <div>
          <dt className="opacity-60">Dimensions</dt>
          <dd className="font-semibold">{dimensions}</dd>
        </div>
        <div>
          <dt className="opacity-60">Price</dt>
          <dd className="font-semibold">{data.priceInr ? `₹${Number(data.priceInr).toLocaleString('en-IN')}` : '—'}</dd>
        </div>
        <div>
          <dt className="opacity-60">Survey</dt>
          <dd className="font-semibold">{data.surveyNumber ?? '—'}</dd>
        </div>
        <div>
          <dt className="opacity-60">Facing</dt>
          <dd className="font-semibold">{data.facing ?? '—'}</dd>
        </div>
        <div>
          <dt className="opacity-60">Customer</dt>
          <dd className="font-semibold">{data.customer?.name ?? '—'}</dd>
        </div>
        <div>
          <dt className="opacity-60">Archived</dt>
          <dd className="font-semibold">{data.archived ? 'Yes' : 'No'}</dd>
        </div>
        {data.description ? (
          <div className="sm:col-span-2">
            <dt className="opacity-60">Description</dt>
            <dd className="mt-1 font-medium leading-relaxed">{data.description}</dd>
          </div>
        ) : null}
      </dl>

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
