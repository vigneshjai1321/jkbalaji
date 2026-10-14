'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
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

const statuses = ['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATION', 'WON', 'LOST'];

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
    <AdminPanel title="CRM — Lead Pipeline" description="Kanban pipeline with PostgreSQL-backed leads from jkbalaji.in & cheyyarbalaji.com.">
      {isLoading ? (
        <div className="p-8 animate-pulse text-sm text-slate-500">Loading leads…</div>
      ) : (
        <CrmKanban leads={data ?? []} />
      )}
      <h3 className="mt-10 mb-4 text-sm font-bold uppercase tracking-widest text-emerald-500">All leads</h3>
      {isLoading ? (
        <div className="p-8 animate-pulse text-sm text-slate-500">Loading leads…</div>
      ) : (
        <AdminTable
          headers={['Name', 'Phone', 'Site', 'Status', 'Created']}
          rows={(data ?? []).map((l) => [
            l.name,
            l.phone,
            l.site,
            <select
              key={l.id}
              className="rounded-lg bg-slate-900 text-slate-100 border border-white/10 text-xs px-2 py-1"
              value={l.status}
              onChange={(e) => patch.mutate({ id: l.id, status: e.target.value })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>,
            new Date(l.createdAt).toLocaleDateString('en-IN'),
          ])}
        />
      )}
    </AdminPanel>
  );
}
