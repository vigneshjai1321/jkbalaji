'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlotWorkspace } from '@/components/admin/PlotWorkspace';
import { useBusiness } from '@/components/admin/BusinessContext';

export default function PlotsPage() {
  const { business } = useBusiness();
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get('projectId') ?? undefined;

  useEffect(() => {
    if (business === 'jewellery') router.replace('/overview/jewellery');
  }, [business, router]);

  return <PlotWorkspace fixedProjectId={projectId} />;
}
