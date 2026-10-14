'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useEffect, useMemo, useState } from 'react';
import { computeBaseFromRate, formatInr } from '@/lib/plot-currency';

type PlotDetail = {
  plotNumber: string;
  surveyNumber: string | null;
  status: string;
  priceInr: string | null;
  pricePerSqftInr?: string | null;
  areaSqft: string | null;
  lengthFt: string | null;
  widthFt: string | null;
  facing: string | null;
  description: string | null;
  projectId: string | null;
  archived: boolean;
};

type ProjectOption = { id: string; name: string; slug: string; phase: string };

function phase3Blocked(p: ProjectOption) {
  return p.slug === 'jk-nagar-phase-3' || p.phase === 'YET_TO_BE_ANNOUNCED';
}

export default function EditPlotPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const input = useAdminInputClass();
  const [plotNumber, setPlotNumber] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [pricePerSqft, setPricePerSqft] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [lengthFt, setLengthFt] = useState('');
  const [widthFt, setWidthFt] = useState('');
  const [facing, setFacing] = useState('');
  const [description, setDescription] = useState('');
  const [archived, setArchived] = useState(false);
  const [error, setError] = useState('');

  const projects = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminFetch<ProjectOption[]>('/projects'),
  });

  const { data } = useQuery({
    queryKey: ['erp-plot', id],
    queryFn: () => adminFetch<PlotDetail>(`/erp/plots/${id}`),
  });

  useEffect(() => {
    if (data) {
      setPlotNumber(data.plotNumber);
      setSurveyNumber(data.surveyNumber ?? '');
      setProjectId(data.projectId ?? '');
      setStatus(data.status);
      setPricePerSqft(data.pricePerSqftInr ?? '');
      setAreaSqft(data.areaSqft ?? '');
      setLengthFt(data.lengthFt ?? '');
      setWidthFt(data.widthFt ?? '');
      setFacing(data.facing ?? '');
      setDescription(data.description ?? '');
      setArchived(data.archived);
    }
  }, [data]);

  const basePreview = useMemo(() => {
    const a = areaSqft ? Number(areaSqft) : NaN;
    const r = pricePerSqft ? Number(pricePerSqft) : NaN;
    return computeBaseFromRate(a, r);
  }, [areaSqft, pricePerSqft]);

  const save = useMutation({
    mutationFn: () =>
      adminFetch(`/erp/plots/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          plotNumber,
          surveyNumber: surveyNumber || null,
          projectId: projectId || null,
          status,
          pricePerSqftInr: pricePerSqft ? Number(pricePerSqft) : null,
          areaSqft: areaSqft ? Number(areaSqft) : null,
          lengthFt: lengthFt ? Number(lengthFt) : null,
          widthFt: widthFt ? Number(widthFt) : null,
          facing: facing || null,
          description: description || null,
          archived,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp-plots'] });
      qc.invalidateQueries({ queryKey: ['erp-plots-summary'] });
      qc.invalidateQueries({ queryKey: ['erp-plot', id] });
      router.push(`/plots/${id}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  const moveTarget = (projects.data ?? []).find((p) => p.id === projectId);
  const moveBlocked = moveTarget && data && projectId !== data.projectId && phase3Blocked(moveTarget);

  return (
    <AdminPanel title="Edit plot">
      <form
        className="grid max-w-3xl gap-4 p-6 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          save.mutate();
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
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {moveBlocked ? <p className="sm:col-span-2 text-sm text-amber-800">Cannot move plots into a coming-soon phase.</p> : null}
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
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} />
          Archived (hidden from active inventory)
        </label>
        {error ? <p className="sm:col-span-2 text-sm text-red-700">{error}</p> : null}
        <div className="sm:col-span-2">
          <AdminBtnPrimary type="submit" disabled={save.isPending || moveBlocked}>
            Save
          </AdminBtnPrimary>
        </div>
      </form>
    </AdminPanel>
  );
}
