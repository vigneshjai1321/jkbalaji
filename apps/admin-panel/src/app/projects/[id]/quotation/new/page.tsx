'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { PlotQuotationForm } from '@/components/admin/PlotQuotationForm';

export default function NewPlotQuotationPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const plotId = searchParams.get('plotId') ?? undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-project-meta', id],
    queryFn: () => adminFetch<{ id: string; name: string }>(`/projects/${id}`),
  });

  if (isLoading || !data) return <p className="p-6 text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-3">
      <Link href={`/projects/${id}/plots`} className="text-sm text-blue-700 hover:underline">
        ← Plots
      </Link>
      <AdminPanel title="New plot quotation">
        <div className="p-4 md:p-6">
          <PlotQuotationForm projectId={data.id} projectName={data.name} initialPlotId={plotId} />
        </div>
      </AdminPanel>
    </div>
  );
}
