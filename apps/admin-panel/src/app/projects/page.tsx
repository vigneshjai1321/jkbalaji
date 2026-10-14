'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { projectPhaseLabel, PROJECT_PHASES } from '@/lib/project-phase';
import { useAdminTheme } from '@/components/admin/AdminShell';
import { clsx } from 'clsx';

type Project = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phase: string;
  phaseLabel: string | null;
  coverImage: string | null;
  published: boolean;
  lifecycle?: string;
  _count: { properties: number; plots: number; leads: number };
};

const PAGE_SIZE = 9;

export default function ProjectsAdminPage() {
  const dark = useAdminTheme() === 'dark';
  const [q, setQ] = useState('');
  const [phase, setPhase] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'active' | 'completed' | 'archived'>('active');
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminFetch<Project[]>('/projects'),
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((project) => {
      const lifecycle = project.lifecycle ?? 'ACTIVE';
      if (view === 'completed' && lifecycle !== 'COMPLETED') return false;
      if (view === 'archived' && lifecycle !== 'ARCHIVED') return false;
      if (view === 'active' && (lifecycle === 'COMPLETED' || lifecycle === 'ARCHIVED')) return false;
      if (phase && project.phase !== phase) return false;
      if (!term) return true;
      return [project.name, project.slug, project.location, project.phaseLabel].some((value) =>
        value?.toLowerCase().includes(term),
      );
    });
  }, [data, q, phase, view]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const card = dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white';

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-[1.65rem] font-bold tracking-tight">Projects</h1>
          <p className="mt-1.5 text-sm md:text-[15px] text-slate-600">Each development is its own record. JK Nagar phases are separate projects.</p>
        </div>
        <Link href="/projects/new" className="inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
          + Add Project
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ['active', 'Active'],
          ['completed', 'Completed'],
          ['archived', 'Archived'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setView(key);
              setPage(1);
            }}
            className={clsx('rounded-lg px-3 py-2 text-sm font-semibold', view === key ? 'bg-blue-700 text-white' : 'border border-slate-300 bg-white')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={clsx('rounded-2xl border p-4 flex flex-col gap-3 md:flex-row', card)}>
        <label className="grid flex-1 gap-1 text-sm">
          <span className="font-medium text-slate-600">Search</span>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Name, slug, or location"
            className="rounded-lg border border-slate-200 px-3 py-2.5"
          />
        </label>
        <label className="grid gap-1 text-sm md:w-56">
          <span className="font-medium text-slate-600">Status</span>
          <select
            value={phase}
            onChange={(e) => {
              setPhase(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2.5"
          >
            <option value="">All statuses</option>
            {PROJECT_PHASES.map((item) => (
              <option key={item} value={item}>
                {projectPhaseLabel(item)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? <p className="text-sm text-slate-500">Loading projects…</p> : null}
      {isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {error instanceof Error ? error.message : 'Could not load projects.'}
          <button type="button" className="ml-3 underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && slice.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-600">No projects match this search.</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slice.map((project) => (
          <article key={project.id} className={clsx('flex flex-col rounded-2xl border overflow-hidden', card)}>
            {project.coverImage ? (
              <img src={project.coverImage} alt="" className="h-36 w-full object-cover bg-slate-100" />
            ) : null}
            <div className="flex flex-1 flex-col gap-2 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{projectPhaseLabel(project.phase)}</span>
                <span className={clsx('rounded-full px-2.5 py-1 text-xs font-semibold', project.published ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600')}>
                  {project.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{project.name}</h2>
              <p className="text-sm text-slate-500 break-all">{project.slug}</p>
              {project.phaseLabel ? <p className="text-sm text-slate-700">Phase: {project.phaseLabel}</p> : null}
              {project.location ? <p className="text-sm text-slate-700">{project.location}</p> : null}
              <p className="text-sm text-slate-700">{project._count.leads} enquiries</p>
              {project._count.plots > 0 ? <p className="text-sm text-slate-700">{project._count.plots} linked plots</p> : null}
              {project._count.properties > 0 ? <p className="text-sm text-slate-700">{project._count.properties} linked properties</p> : null}
              <div className="mt-auto flex gap-2 pt-3">
                <Link href={`/projects/${project.id}`} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                  View
                </Link>
                <Link href={`/projects/${project.id}/edit`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">
                  Edit
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pages > 1 ? (
        <div className="flex items-center gap-3 text-sm">
          <button type="button" className="rounded-lg border px-3 py-2 disabled:opacity-40" disabled={current <= 1} onClick={() => setPage(current - 1)}>
            Previous
          </button>
          <span>
            Page {current} of {pages}
          </span>
          <button type="button" className="rounded-lg border px-3 py-2 disabled:opacity-40" disabled={current >= pages} onClick={() => setPage(current + 1)}>
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
