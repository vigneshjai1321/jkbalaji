'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary } from '@/components/admin/AdminForm';
import { useState } from 'react';
import { PlotFormFields, type PlotFormValues } from '@/components/admin/PlotFormFields';

type ProjectOption = { id: string; name: string; slug: string; phase: string };

function phase3Blocked(p: ProjectOption) {
  return p.slug === 'jk-nagar-phase-3' || p.phase === 'YET_TO_BE_ANNOUNCED';
}

export default function NewPlotPage() {
  const router = useRouter();
  const params = useSearchParams();
  const initialProject = params.get('projectId') ?? '';
  const [values, setValues] = useState<PlotFormValues>({
    plotNumber: '',
    surveyNumber: '',
    projectId: initialProject,
    status: 'AVAILABLE',
    pricePerSqft: '',
    areaSqft: '',
    lengthFt: '',
    widthFt: '',
    facing: '',
    description: '',
    brokerId: null,
  });
  const [error, setError] = useState('');

  const projects = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminFetch<ProjectOption[]>('/projects'),
  });

  const selected = (projects.data ?? []).find((p) => p.id === values.projectId);
  const blocked = selected ? phase3Blocked(selected) : false;

  const create = useMutation({
    mutationFn: () =>
      adminFetch<{ id: string }>('/erp/plots', {
        method: 'POST',
        body: JSON.stringify({
          plotNumber: values.plotNumber,
          surveyNumber: values.surveyNumber || undefined,
          projectId: values.projectId,
          status: values.status,
          pricePerSqftInr: values.pricePerSqft ? Number(values.pricePerSqft) : undefined,
          areaSqft: values.areaSqft ? Number(values.areaSqft) : undefined,
          lengthFt: values.lengthFt ? Number(values.lengthFt) : undefined,
          widthFt: values.widthFt ? Number(values.widthFt) : undefined,
          facing: values.facing || undefined,
          description: values.description || undefined,
          brokerId: values.brokerId ?? undefined,
        }),
      }),
    onSuccess: (row: { id: string }) => router.push(`/plots/${row.id}`),
    onError: (err: Error) => setError(err.message),
  });

  return (
    <AdminPanel title="Add plot">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          create.mutate();
        }}
      >
        <PlotFormFields
          values={values}
          onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          projects={projects.data ?? []}
          projectBlocked={blocked}
          brokerDisabled={blocked}
          extraFooter={
            <>
              {blocked ? <p className="text-sm text-amber-800">This phase is not open for new plots yet.</p> : null}
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <AdminBtnPrimary type="submit" disabled={create.isPending || blocked || !values.projectId}>
                Save
              </AdminBtnPrimary>
            </>
          }
        />
      </form>
    </AdminPanel>
  );
}
