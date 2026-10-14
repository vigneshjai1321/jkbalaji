'use client';

import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import Link from 'next/link';

type Followup = {
  id: string;
  dueAt: string;
  notes: string | null;
  lead: { name: string; phone: string; status: string };
  assignedTo: { name: string } | null;
};

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['crm-followups'],
    queryFn: () => adminFetch<Followup[]>('/crm/followups/pending'),
  });

  return (
    <AdminPanel
      title="Tasks & Follow-ups"
      description="Pending CRM follow-ups from PostgreSQL."
      actions={
        <Link href="/crm" className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-500">
          Open pipeline
        </Link>
      }
    >
      {isLoading ? (
        <div className="p-8 text-sm opacity-60">Loading…</div>
      ) : (
        <AdminTable
          headers={['Due', 'Lead', 'Phone', 'Status', 'Assigned', 'Notes']}
          rows={(data ?? []).map((f) => [
            new Date(f.dueAt).toLocaleString('en-IN'),
            f.lead.name,
            f.lead.phone,
            f.lead.status,
            f.assignedTo?.name ?? '—',
            f.notes ?? '—',
          ])}
        />
      )}
    </AdminPanel>
  );
}
