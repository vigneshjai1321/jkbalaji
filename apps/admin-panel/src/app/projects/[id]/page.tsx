'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { projectPhaseLabel } from '@/lib/project-phase';

type ProjectDetail = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phase: string;
  phaseLabel: string | null;
  description: string | null;
  coverImage: string | null;
  published: boolean;
  _count: { properties: number; plots: number; leads: number };
  properties: { id: string; title: string; slug: string; location: string; status: string; plotNo: string | null }[];
  plots: { id: string; plotNumber: string; status: string }[];
  leads: { id: string; name: string; phone: string; status: string; leadType: string | null; createdAt: string }[];
};

export default function ProjectViewPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: () => adminFetch<ProjectDetail>(`/projects/${id}`),
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useMutation({
    mutationFn: () => adminFetch<{ archived?: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
    onSuccess: async (result) => {
      await qc.invalidateQueries({ queryKey: ['admin-projects'] });
      if (result?.archived) {
        await qc.invalidateQueries({ queryKey: ['admin-project', id] });
        setConfirmDelete(false);
        return;
      }
      window.location.href = '/projects';
    },
  });
  const publish = useMutation({
    mutationFn: (published: boolean) => adminFetch(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify({ published }) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-project', id] });
      void qc.invalidateQueries({ queryKey: ['admin-projects'] });
    },
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading project…</p>;
  if (isError || !data) {
    return <p className="text-sm text-red-700">{error instanceof Error ? error.message : 'Project not found.'}</p>;
  }

  return (
    <div className="max-w-[1100px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{data.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/projects/${id}/edit`} className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white">
            Edit
          </Link>
          <button type="button" className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700" onClick={() => setConfirmDelete(true)}>
            Delete or archive
          </button>
        </div>
      </div>

      {confirmDelete ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm">
          <p className="font-semibold text-red-900">Remove {data.name}?</p>
          <p className="mt-1 text-red-800">If this project has properties, plots, enquiries, or commissions, it will be archived instead of deleted. Related records stay in place.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="rounded-lg bg-red-700 px-3 py-2 font-semibold text-white" disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? 'Working…' : 'Confirm'}
            </button>
            <button type="button" className="rounded-lg border px-3 py-2" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
          {remove.isError ? <p className="mt-2 text-red-700">{remove.error instanceof Error ? remove.error.message : 'Could not remove the project.'}</p> : null}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold">Overview</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="font-semibold">{projectPhaseLabel(data.phase)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phase</dt>
            <dd className="font-semibold">{data.phaseLabel ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd className="font-semibold">{data.location ?? 'Not recorded'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Enquiries</dt>
            <dd className="font-semibold">{data._count.leads}</dd>
          </div>
          {data._count.plots > 0 ? (
            <div>
              <dt className="text-slate-500">Linked plots</dt>
              <dd className="font-semibold">{data._count.plots}</dd>
            </div>
          ) : null}
          {data._count.properties > 0 ? (
            <div>
              <dt className="text-slate-500">Linked properties</dt>
              <dd className="font-semibold">{data._count.properties}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold">Project information</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{data.description || 'No description saved.'}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">Plots</h2>
          <Link href={`/projects/${id}/plots`} className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
            Manage plots
          </Link>
        </div>
        {data.slug === 'jk-nagar-phase-3' || data.phase === 'YET_TO_BE_ANNOUNCED' ? (
          <p className="mt-3 text-sm text-slate-600">Coming soon — plot inventory opens when this phase launches.</p>
        ) : data._count.plots === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No plots yet. Use Manage plots to add inventory.</p>
        ) : (
          <p className="mt-3 text-sm text-slate-600">{data._count.plots} plot record{data._count.plots === 1 ? '' : 's'} in the database.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold">Properties</h2>
        {data.properties.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No property listings linked to this project.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {data.properties.map((property) => (
              <li key={property.id}>
                <Link href={`/realestate/${property.id}`} className="text-blue-700 hover:underline">
                  {property.title}
                </Link>{' '}
                — {property.status}
                {property.location ? ` · ${property.location}` : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Enquiries</h2>
          <Link href="/leads?site=REAL_ESTATE" className="text-sm font-medium text-blue-700 hover:underline">
            All real estate leads
          </Link>
        </div>
        {data.leads.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No enquiries are linked to this project yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {data.leads.map((lead) => (
              <li key={lead.id} className="py-2.5">
                <span className="font-medium">{lead.name}</span> · {lead.phone} · {lead.status}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold">Images</h2>
        {data.coverImage ? (
          <img src={data.coverImage} alt="" className="mt-3 max-h-64 rounded-xl object-cover" />
        ) : (
          <p className="mt-3 text-sm text-slate-600">No cover image saved.</p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold">Publication</h2>
        <p className="mt-2 text-sm text-slate-600">
          {data.published ? 'Visible in the public project listing.' : 'Hidden from public visitors. Drafts are not listed on jkbalaji.in.'}
        </p>
        <button
          type="button"
          className="mt-4 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold"
          disabled={publish.isPending}
          onClick={() => publish.mutate(!data.published)}
        >
          {data.published ? 'Unpublish' : 'Publish'}
        </button>
        {publish.isError ? <p className="mt-2 text-sm text-red-700">{publish.error instanceof Error ? publish.error.message : 'Could not update publication.'}</p> : null}
      </section>
    </div>
  );
}
