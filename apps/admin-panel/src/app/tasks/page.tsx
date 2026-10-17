'use client';

import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPanel } from '@/components/admin/AdminPanel';
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
      <div className="p-4">
        <AdminDataTable
          columns={[
            { id: 'due', header: 'Due', defaultWidth: 168, cell: (f: Followup) => new Date(f.dueAt).toLocaleString('en-IN') },
            { id: 'lead', header: 'Lead', defaultWidth: 160, cell: (f: Followup) => <span title={f.lead.name}>{f.lead.name}</span> },
            { id: 'phone', header: 'Phone', defaultWidth: 130, cell: (f: Followup) => f.lead.phone },
            { id: 'status', header: 'Status', defaultWidth: 120, cell: (f: Followup) => f.lead.status },
            { id: 'assigned', header: 'Assigned', defaultWidth: 140, cell: (f: Followup) => f.assignedTo?.name ?? '—' },
            { id: 'notes', header: 'Notes', defaultWidth: 220, cell: (f: Followup) => f.notes ?? '—' },
          ]}
          rows={data ?? []}
          rowKey={(f) => f.id}
          isLoading={isLoading}
          emptyMessage="No pending follow-ups."
          columnLayout={{ tableId: 'tasks', requiredVisible: ['lead', 'due'] }}
        />
      </div>
    </AdminPanel>
  );
}
