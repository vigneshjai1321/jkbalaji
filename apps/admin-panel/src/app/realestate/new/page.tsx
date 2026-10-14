'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';

const KINDS = [
  ['RESIDENTIAL_PLOT', 'Residential plot'],
  ['CORNER_PLOT', 'Corner plot'],
  ['VILLA', 'Villa'],
  ['INDEPENDENT_HOUSE', 'Independent house'],
  ['FARMLAND', 'Farmland'],
  ['PLOT_WITH_HOUSE', 'Plot with house'],
  ['OTHER', 'Other'],
] as const;

const BUILT = new Set(['VILLA', 'INDEPENDENT_HOUSE', 'PLOT_WITH_HOUSE']);

export default function NewPropertyPage() {
  const router = useRouter();
  const input = useAdminInputClass();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [priceInr, setPriceInr] = useState('');
  const [kind, setKind] = useState('RESIDENTIAL_PLOT');
  const [projectId, setProjectId] = useState('');
  const [landArea, setLandArea] = useState('');
  const [areaUnit, setAreaUnit] = useState('SQFT');
  const [builtUp, setBuiltUp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const projects = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminFetch<{ id: string; name: string }[]>('/projects'),
  });

  const create = useMutation({
    mutationFn: () =>
      adminFetch<{ id: string }>('/properties', {
        method: 'POST',
        body: JSON.stringify({
          title,
          slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          location,
          priceInr: Number(priceInr),
          status: 'AVAILABLE',
          kind,
          projectId: projectId || undefined,
          landArea: landArea ? Number(landArea) : undefined,
          areaUnit,
          builtUpSqft: builtUp ? Number(builtUp) : undefined,
          published: false,
        }),
      }),
    onSuccess: (row) => router.push(`/realestate/${row.id}`),
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save the property'),
  });

  return (
    <AdminPanel title="Add property">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          create.mutate();
        }}
      >
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} required />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Project</span>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={input}>
            <option value="">No project yet</option>
            {(projects.data ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Property type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={input}>
            {KINDS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Location</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={input} required />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Land area</span>
            <input type="number" min="0" step="0.01" value={landArea} onChange={(e) => setLandArea(e.target.value)} className={input} placeholder="Optional" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Unit</span>
            <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className={input}>
              {['SQFT', 'SQYD', 'SQM', 'ACRE', 'CENT'].map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
          </label>
        </div>
        {BUILT.has(kind) ? (
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Built-up area (sq ft)</span>
            <input type="number" min="0" step="0.01" value={builtUp} onChange={(e) => setBuiltUp(e.target.value)} className={input} placeholder="Optional" />
          </label>
        ) : null}
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Asking price (INR)</span>
          <input type="number" min="0" value={priceInr} onChange={(e) => setPriceInr(e.target.value)} className={input} required />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <AdminBtnPrimary type="submit" disabled={create.isPending}>
          {create.isPending ? 'Saving…' : 'Save property'}
        </AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
