'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useMemo, useState } from 'react';
import { computeBaseFromRate, formatInr } from '@/lib/plot-currency';

type ProjectOption = { id: string; name: string; slug: string; phase: string };

function phase3Blocked(p: ProjectOption) {
  return p.slug === 'jk-nagar-phase-3' || p.phase === 'YET_TO_BE_ANNOUNCED';
}

export default function NewPlotPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialProject = params.get('projectId') ?? '';
  const input = useAdminInputClass();
  const [plotNumber, setPlotNumber] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [projectId, setProjectId] = useState(initialProject);
  const [status, setStatus] = useState('AVAILABLE');
  const [pricePerSqft, setPricePerSqft] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [lengthFt, setLengthFt] = useState('');
  const [widthFt, setWidthFt] = useState('');
  const [facing, setFacing] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const projects = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminFetch<ProjectOption[]>('/projects'),
  });

  const selected = (projects.data ?? []).find((p) => p.id === projectId);
  const blocked = selected ? phase3Blocked(selected) : false;
  const basePreview = useMemo(() => {
    const a = areaSqft ? Number(areaSqft) : NaN;
    const r = pricePerSqft ? Number(pricePerSqft) : NaN;
    return computeBaseFromRate(a, r);
  }, [areaSqft, pricePerSqft]);

  const create = useMutation({
    mutationFn: () =>
      adminFetch<{ id: string }>('/erp/plots', {
        method: 'POST',
        body: JSON.stringify({
          plotNumber,
          surveyNumber: surveyNumber || undefined,
          projectId,
          status,
          pricePerSqftInr: pricePerSqft ? Number(pricePerSqft) : undefined,
          areaSqft: areaSqft ? Number(areaSqft) : undefined,
          lengthFt: lengthFt ? Number(lengthFt) : undefined,
          widthFt: widthFt ? Number(widthFt) : undefined,
          facing: facing || undefined,
          description: description || undefined,
        }),
      }),
    onSuccess: (row: { id: string }) => router.push(`/plots/${row.id}`),
    onError: (err: Error) => setError(err.message),
  });

  return (
    <AdminPanel title="Add plot">
      <form
        className="grid max-w-3xl gap-4 p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          create.mutate();
        }}
      >
        <label className="text-sm sm:col-span-2">
          Plot number
          <input className={`${input} mt-1`} value={plotNumber} onChange={(e) => setPlotNumber(e.target.value)} required />
        </label>
        <label className="text-sm sm:col-span-2">
          Project
          <select className={`${input} mt-1`} value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
            <option value="">Select project</option>
            {(projects.data ?? []).map((p) => (
              <option key={p.id} value={p.id} disabled={phase3Blocked(p)}>
                {p.name}
                {phase3Blocked(p) ? ' (coming soon)' : ''}
              </option>
            ))}
          </select>
        </label>
        {blocked ? <p className="sm:col-span-2 text-sm text-amber-800">This phase is not open for new plots yet.</p> : null}
        <label className="text-sm">
          Area (sq ft)
          <input type="number" className={`${input} mt-1`} value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} min={0} />
        </label>
        <label className="text-sm">
          Status
          <select className={`${input} mt-1`} value={status} onChange={(e) => setStatus(e.target.value)}>
            {['AVAILABLE', 'RESERVED', 'SOLD', 'BLOCKED'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Length (ft)
          <input type="number" className={`${input} mt-1`} value={lengthFt} onChange={(e) => setLengthFt(e.target.value)} min={0} />
        </label>
        <label className="text-sm">
          Width (ft)
          <input type="number" className={`${input} mt-1`} value={widthFt} onChange={(e) => setWidthFt(e.target.value)} min={0} />
        </label>
        <label className="text-sm">
          Price per sq ft (₹)
          <input type="number" className={`${input} mt-1`} value={pricePerSqft} onChange={(e) => setPricePerSqft(e.target.value)} min={0} />
        </label>
        <div className="text-sm rounded-lg border p-3 bg-slate-50">
          <p className="text-slate-500 text-xs">Base plot price (auto)</p>
          <p className="font-semibold tabular-nums">{basePreview != null ? formatInr(basePreview) : '—'}</p>
        </div>
        <label className="text-sm">
          Survey number
          <input className={`${input} mt-1`} value={surveyNumber} onChange={(e) => setSurveyNumber(e.target.value)} />
        </label>
        <label className="text-sm">
          Facing
          <input className={`${input} mt-1`} value={facing} onChange={(e) => setFacing(e.target.value)} />
        </label>
        <label className="text-sm sm:col-span-2">
          Description
          <textarea className={`${input} mt-1 min-h-[80px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        {error ? <p className="sm:col-span-2 text-sm text-red-700">{error}</p> : null}
        <div className="sm:col-span-2">
          <AdminBtnPrimary type="submit" disabled={create.isPending || blocked || !projectId}>
            Save
          </AdminBtnPrimary>
        </div>
      </form>
    </AdminPanel>
  );
}
