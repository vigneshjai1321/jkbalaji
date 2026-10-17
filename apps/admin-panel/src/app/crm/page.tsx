'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { CrmKanban } from '@/components/admin/CrmKanban';

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  site: string;
  createdAt: string;
};

const statuses = ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'];

export default function AdminCrmPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => adminFetch<Lead[]>('/leads'),
  });

  const patch = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-leads'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  return (
    <AdminPanel title="CRM" description="Lead pipeline and status updates.">
      {isLoading ? (
        <div className="p-8 animate-pulse text-sm text-slate-500">Loading leads…</div>
      ) : (
        <CrmKanban leads={data ?? []} />
      )}
      <h3 className="mt-10 mb-4 text-sm font-bold uppercase tracking-widest text-emerald-500">All leads</h3>
      <AdminDataTable
        columns={[
          { id: 'name', header: 'Name', defaultWidth: 160, cell: (l: Lead) => <span title={l.name}>{l.name}</span> },
          { id: 'phone', header: 'Phone', defaultWidth: 130, cell: (l: Lead) => l.phone },
          { id: 'site', header: 'Site', defaultWidth: 120, cell: (l: Lead) => l.site },
          {
            id: 'status',
            header: 'Status',
            truncate: false,
            defaultWidth: 160,
            cell: (l: Lead) => (
              <select
                className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-100"
                value={l.status}
                onChange={(e) => patch.mutate({ id: l.id, status: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            ),
          },
          { id: 'created', header: 'Created', defaultWidth: 120, cell: (l: Lead) => new Date(l.createdAt).toLocaleDateString('en-IN') },
        ]}
        rows={Array.isArray(data) ? data : []}
        rowKey={(l) => l.id}
        isLoading={isLoading}
        emptyMessage="No leads."
        columnLayout={{ tableId: 'crm-leads', requiredVisible: ['name', 'status'] }}
      />
    </AdminPanel>
  );
}
