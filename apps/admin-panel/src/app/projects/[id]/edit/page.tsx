'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { ProjectForm, type ProjectFormValues } from '@/components/admin/ProjectForm';

type ProjectRow = {
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  phaseLabel: string | null;
  phase: string;
  coverImage: string | null;
  published: boolean;
  lifecycle?: string;
  notes?: string | null;
};

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-project', id],
    queryFn: () => adminFetch<ProjectRow>(`/projects/${id}`),
  });

  const initial = useMemo<ProjectFormValues | null>(
    () =>
      data
        ? {
            name: data.name,
            slug: data.slug,
            description: data.description ?? '',
            location: data.location ?? '',
            phaseLabel: data.phaseLabel ?? '',
            phase: data.phase,
            coverImage: data.coverImage ?? '',
            published: data.published,
            lifecycle: data.lifecycle ?? 'ACTIVE',
            notes: data.notes ?? '',
          }
        : null,
    [data],
  );

  const save = useMutation({
    mutationFn: (values: ProjectFormValues) => adminFetch(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(values) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-project', id] });
      void qc.invalidateQueries({ queryKey: ['admin-projects'] });
      router.push(`/projects/${id}`);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save the project'),
  });

  if (isLoading || !initial) return <p className="text-sm text-slate-500">Loading project…</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Edit project</h1>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <ProjectForm
          initial={initial}
          submitLabel="Save project"
          pending={save.isPending}
          error={error}
          onSubmit={(values) => {
            setError(null);
            save.mutate(values);
          }}
        />
      </div>
    </div>
  );
}
