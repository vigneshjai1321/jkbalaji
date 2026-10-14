'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminRowActions } from '@/components/admin/AdminRowActions';

type Property = {
  id: string;
  title: string;
  location: string;
  status: string;
  priceInr: string;
  projectName: string | null;
};

export default function AdminRealEstatePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => adminFetch<Property[]>('/properties'),
  });

  return (
    <AdminPanel
      title="Real Estate Management"
      description="Properties synced with jkbalaji.in."
      actions={
        <Link href="/realestate/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Add property
        </Link>
      }
    >
      {isLoading ? (
        <div className="p-8 animate-pulse text-sm text-slate-500">Loading properties…</div>
      ) : (
        <AdminTable
          headers={['Title', 'Location', 'Project', 'Status', 'Price', 'Actions']}
          rows={(data ?? []).map((p) => [
            p.title,
            p.location,
            p.projectName ?? '—',
            p.status,
            `₹${Number(p.priceInr).toLocaleString('en-IN')}`,
            <AdminRowActions key={p.id} base="/realestate" id={p.id} />,
          ])}
        />
      )}
    </AdminPanel>
  );
}
