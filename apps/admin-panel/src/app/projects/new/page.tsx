'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { ProjectForm, type ProjectFormValues } from '@/components/admin/ProjectForm';

const empty: ProjectFormValues = {
  name: '',
  slug: '',
  description: '',
  location: '',
  phaseLabel: '',
  phase: 'ONGOING',
  coverImage: '',
  published: false,
  lifecycle: 'ACTIVE',
  notes: '',
};

export default function NewProjectPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const create = useMutation({
    mutationFn: (values: ProjectFormValues) =>
      adminFetch<{ id: string }>('/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          slug: values.slug || values.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        }),
      }),
    onSuccess: (row) => {
      void qc.invalidateQueries({ queryKey: ['admin-projects'] });
      router.push(`/projects/${row.id}`);
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not create the project'),
  });

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Add project</h1>
      <div className="rounded-2xl border border-slate-200 bg-white">
        <ProjectForm
          initial={empty}
          submitLabel="Create project"
          pending={create.isPending}
          error={error}
          onSubmit={(values) => {
            setError(null);
            create.mutate(values);
          }}
        />
      </div>
    </div>
  );
}
