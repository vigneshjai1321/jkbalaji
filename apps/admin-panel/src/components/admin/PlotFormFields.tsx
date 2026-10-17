'use client';

import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { useAdminInputClass } from '@/components/admin/AdminForm';
import { PlotBrokerSection } from '@/components/admin/PlotBrokerSection';
import { computeBaseFromRate, formatInr } from '@/lib/plot-currency';

type ProjectOption = { id: string; name: string; slug: string; phase: string };

export type PlotFormValues = {
  plotNumber: string;
  surveyNumber: string;
  projectId: string;
  status: string;
  areaSqft: string;
  lengthFt: string;
  widthFt: string;
  pricePerSqft: string;
  facing: string;
  description: string;
  brokerId: string | null;
  archived?: boolean;
};

type Props = {
  values: PlotFormValues;
  onChange: (patch: Partial<PlotFormValues>) => void;
  projects: ProjectOption[];
  projectBlocked?: boolean;
  brokerDisabled?: boolean;
  showArchived?: boolean;
  extraFooter?: React.ReactNode;
};

const STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'BLOCKED'] as const;

const compactLabel = 'text-xs font-medium text-slate-600 dark:text-slate-400';
const fieldWrap = 'flex flex-col gap-0.5 min-w-0';

function ProjectPicker({
  projects,
  projectId,
  onProjectId,
  blocked,
}: {
  projects: ProjectOption[];
  projectId: string;
  onProjectId: (id: string) => void;
  blocked?: boolean;
}) {
  const input = useAdminInputClass();
  const [filter, setFilter] = useState('');
  const filtered = useMemo(() => {
    const t = filter.trim().toLowerCase();
    if (!t) return projects;
    return projects.filter((p) => p.name.toLowerCase().includes(t) || p.slug.toLowerCase().includes(t));
  }, [projects, filter]);

  return (
    <div className={fieldWrap}>
      <span className={compactLabel}>Project</span>
      <input
        className={clsx(input, 'py-1.5 text-sm')}
        placeholder="Search projects…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        aria-label="Search projects"
      />
      <select
        className={clsx(input, 'py-1.5 text-sm')}
        value={projectId}
        onChange={(e) => onProjectId(e.target.value)}
        required
        disabled={blocked}
      >
        <option value="">Select project</option>
        {filtered.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PlotFormFields({
  values,
  onChange,
  projects,
  projectBlocked,
  brokerDisabled,
  showArchived,
  extraFooter,
}: Props) {
  const input = useAdminInputClass();
  const compactInput = clsx(input, 'py-1.5 text-sm');

  const basePreview = useMemo(() => {
    const a = values.areaSqft ? Number(values.areaSqft) : NaN;
    const r = values.pricePerSqft ? Number(values.pricePerSqft) : NaN;
    return computeBaseFromRate(a, r);
  }, [values.areaSqft, values.pricePerSqft]);

  return (
    <div className="max-w-5xl space-y-3 p-4 sm:p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-2 sm:gap-3">
        <label className={clsx(fieldWrap, 'col-span-2 sm:col-span-2 lg:col-span-2')}>
          <span className={compactLabel}>Plot number</span>
          <input
            className={compactInput}
            value={values.plotNumber}
            onChange={(e) => onChange({ plotNumber: e.target.value })}
            required
          />
        </label>
        <div className="col-span-2 sm:col-span-2 lg:col-span-4">
          <ProjectPicker
            projects={projects}
            projectId={values.projectId}
            onProjectId={(id) => onChange({ projectId: id })}
            blocked={projectBlocked}
          />
        </div>
        <label className={clsx(fieldWrap, 'col-span-1 sm:col-span-1 lg:col-span-2')}>
          <span className={compactLabel}>Area (sq ft)</span>
          <input
            type="number"
            className={compactInput}
            value={values.areaSqft}
            onChange={(e) => onChange({ areaSqft: e.target.value })}
            min={0}
          />
        </label>
        <label className={clsx(fieldWrap, 'col-span-1 sm:col-span-1 lg:col-span-2')}>
          <span className={compactLabel}>Status</span>
          <select className={compactInput} value={values.status} onChange={(e) => onChange({ status: e.target.value })}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <label className={fieldWrap}>
          <span className={compactLabel}>Length (ft)</span>
          <input type="number" className={compactInput} value={values.lengthFt} onChange={(e) => onChange({ lengthFt: e.target.value })} min={0} />
        </label>
        <label className={fieldWrap}>
          <span className={compactLabel}>Width (ft)</span>
          <input type="number" className={compactInput} value={values.widthFt} onChange={(e) => onChange({ widthFt: e.target.value })} min={0} />
        </label>
        <label className={fieldWrap}>
          <span className={compactLabel}>Price per sq ft (₹)</span>
          <input
            type="number"
            className={compactInput}
            value={values.pricePerSqft}
            onChange={(e) => onChange({ pricePerSqft: e.target.value })}
            min={0}
          />
        </label>
        <div className={clsx(fieldWrap, 'rounded-lg border border-slate-200 dark:border-white/10 px-2 py-1.5 bg-slate-50/80 dark:bg-white/5')}>
          <span className={compactLabel}>Base plot price</span>
          <p className="text-sm font-semibold tabular-nums">{basePreview != null ? formatInr(basePreview) : '—'}</p>
          <p className="text-[10px] text-slate-500">Calculated from area × rate</p>
        </div>
      </div>

      {values.projectId ? (
        <PlotBrokerSection
          brokerId={values.brokerId}
          projectId={values.projectId}
          onBrokerIdChange={(id) => onChange({ brokerId: id })}
          disabled={brokerDisabled}
          basePlotPriceInr={basePreview}
          compact
        />
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3">
        <label className={clsx(fieldWrap, 'sm:col-span-3')}>
          <span className={compactLabel}>Survey number</span>
          <input className={compactInput} value={values.surveyNumber} onChange={(e) => onChange({ surveyNumber: e.target.value })} />
        </label>
        <label className={clsx(fieldWrap, 'sm:col-span-3')}>
          <span className={compactLabel}>Facing</span>
          <input className={compactInput} value={values.facing} onChange={(e) => onChange({ facing: e.target.value })} />
        </label>
        <label className={clsx(fieldWrap, 'col-span-2 sm:col-span-6')}>
          <span className={compactLabel}>Description</span>
          <textarea
            className={clsx(compactInput, 'min-h-[56px] resize-y')}
            value={values.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </label>
      </div>

      {showArchived ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={Boolean(values.archived)} onChange={(e) => onChange({ archived: e.target.checked })} />
          Archived
        </label>
      ) : null}

      {extraFooter}
    </div>
  );
}
