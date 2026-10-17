'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary } from '@/components/admin/AdminForm';
import { useEffect, useState } from 'react';
import { PlotFormFields, type PlotFormValues } from '@/components/admin/PlotFormFields';

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
  brokerId?: string | null;
};

type ProjectOption = { id: string; name: string; slug: string; phase: string };

function phase3Blocked(p: ProjectOption) {
  return p.slug === 'jk-nagar-phase-3' || p.phase === 'YET_TO_BE_ANNOUNCED';
}

export default function EditPlotPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [values, setValues] = useState<PlotFormValues>({
    plotNumber: '',
    surveyNumber: '',
    projectId: '',
    status: 'AVAILABLE',
    pricePerSqft: '',
    areaSqft: '',
    lengthFt: '',
    widthFt: '',
    facing: '',
    description: '',
    brokerId: null,
    archived: false,
  });
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
      setValues({
        plotNumber: data.plotNumber,
        surveyNumber: data.surveyNumber ?? '',
        projectId: data.projectId ?? '',
        status: data.status,
        pricePerSqft: data.pricePerSqftInr ?? '',
        areaSqft: data.areaSqft ?? '',
        lengthFt: data.lengthFt ?? '',
        widthFt: data.widthFt ?? '',
        facing: data.facing ?? '',
        description: data.description ?? '',
        archived: data.archived,
        brokerId: data.brokerId ?? null,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      adminFetch(`/erp/plots/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          plotNumber: values.plotNumber,
          surveyNumber: values.surveyNumber || null,
          projectId: values.projectId || null,
          status: values.status,
          pricePerSqftInr: values.pricePerSqft ? Number(values.pricePerSqft) : null,
          areaSqft: values.areaSqft ? Number(values.areaSqft) : null,
          lengthFt: values.lengthFt ? Number(values.lengthFt) : null,
          widthFt: values.widthFt ? Number(values.widthFt) : null,
          facing: values.facing || null,
          description: values.description || null,
          archived: values.archived,
          brokerId: values.brokerId,
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

  const moveTarget = (projects.data ?? []).find((p) => p.id === values.projectId);
  const moveBlocked = moveTarget && data && values.projectId !== data.projectId && phase3Blocked(moveTarget);

  return (
    <AdminPanel title="Edit plot">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError('');
          save.mutate();
        }}
      >
        <PlotFormFields
          values={values}
          onChange={(patch) => setValues((v) => ({ ...v, ...patch }))}
          projects={projects.data ?? []}
          brokerDisabled={Boolean(moveBlocked)}
          showArchived
          extraFooter={
            <>
              {moveBlocked ? <p className="text-sm text-amber-800">Cannot move plots into a coming-soon phase.</p> : null}
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
              <AdminBtnPrimary type="submit" disabled={save.isPending || moveBlocked}>
                Save
              </AdminBtnPrimary>
            </>
          }
        />
      </form>
    </AdminPanel>
  );
}
