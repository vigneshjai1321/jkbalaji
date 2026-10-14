'use client';

import { useEffect, useState } from 'react';
import { AdminBtnPrimary, useAdminInputClass } from './AdminForm';
import { PROJECT_PHASES, projectPhaseLabel } from '@/lib/project-phase';

const LIFECYCLES = [
  ['PLANNING', 'Planning'],
  ['ACTIVE', 'Active'],
  ['ON_HOLD', 'On hold'],
  ['COMPLETED', 'Completed'],
  ['ARCHIVED', 'Archived'],
] as const;

export type ProjectFormValues = {
  name: string;
  slug: string;
  description: string;
  location: string;
  phaseLabel: string;
  phase: string;
  coverImage: string;
  published: boolean;
  lifecycle: string;
  notes: string;
};

export function ProjectForm({
  initial,
  submitLabel,
  pending,
  error,
  onSubmit,
}: {
  initial: ProjectFormValues;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: (values: ProjectFormValues) => void;
}) {
  const input = useAdminInputClass();
  const [values, setValues] = useState(initial);

  useEffect(() => {
    setValues(initial);
  }, [initial]);

  function set<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <form
      className="grid gap-4 p-5 md:p-6 max-w-2xl"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Project name</span>
        <input required value={values.name} onChange={(e) => set('name', e.target.value)} className={input} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Slug</span>
        <input
          required
          value={values.slug}
          onChange={(e) => set('slug', e.target.value.toLowerCase())}
          className={input}
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          title="Lowercase letters, numbers, and hyphens"
        />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Description</span>
        <textarea value={values.description} onChange={(e) => set('description', e.target.value)} className={input} rows={4} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Notes</span>
        <textarea value={values.notes} onChange={(e) => set('notes', e.target.value)} className={input} rows={3} />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Location</span>
        <input value={values.location} onChange={(e) => set('location', e.target.value)} className={input} placeholder="Optional" />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Phase</span>
        <input value={values.phaseLabel} onChange={(e) => set('phaseLabel', e.target.value)} className={input} placeholder="Optional, for example Phase 1" />
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Workspace status</span>
        <select value={values.lifecycle} onChange={(e) => set('lifecycle', e.target.value)} className={input}>
          {LIFECYCLES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Development status</span>
        <select value={values.phase} onChange={(e) => set('phase', e.target.value)} className={input}>
          {PROJECT_PHASES.map((phase) => (
            <option key={phase} value={phase}>
              {projectPhaseLabel(phase)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium text-slate-700">Cover image</span>
        <input
          value={values.coverImage}
          onChange={(e) => set('coverImage', e.target.value)}
          className={input}
          placeholder="Optional https URL or /path"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" checked={values.published} onChange={(e) => set('published', e.target.checked)} className="h-4 w-4" />
        Published on the public website
      </label>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <AdminBtnPrimary type="submit" disabled={pending}>
        {pending ? 'Saving…' : submitLabel}
      </AdminBtnPrimary>
    </form>
  );
}
