'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { PlotWorkspace } from '@/components/admin/PlotWorkspace';

type ProjectMeta = { id: string; name: string; slug: string; phase: string };

function isComingSoon(project: ProjectMeta) {
  return project.slug === 'jk-nagar-phase-3' || project.phase === 'YET_TO_BE_ANNOUNCED';
}

export default function ProjectPlotsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-project-meta', id],
    queryFn: () => adminFetch<ProjectMeta>(`/projects/${id}`),
  });

  if (isLoading || !data) return <p className="p-6 text-sm text-slate-500">Loading…</p>;

  return (
    <div className="space-y-3">
      <Link href={`/projects/${id}`} className="inline-block text-sm font-medium text-blue-700 hover:underline">
        ← Back to project
      </Link>
      <PlotWorkspace fixedProjectId={data.id} fixedProjectName={data.name} comingSoon={isComingSoon(data)} />
    </div>
  );
}
