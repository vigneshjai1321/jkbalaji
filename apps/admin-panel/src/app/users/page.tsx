'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPanel } from '@/components/admin/AdminPanel';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
};

const roles = [
  'SUPER_ADMIN',
  'ADMIN',
  'REAL_ESTATE_MANAGER',
  'SALES_MANAGER',
  'CRM_EXECUTIVE',
  'GOLD_MANAGER',
  'BILLING_STAFF',
  'ACCOUNTANT',
  'EMPLOYEE',
];

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminFetch<UserRow[]>('/users'),
  });

  const [form, setForm] = useState({ email: '', password: '', name: '', role: 'EMPLOYEE', department: '' });

  const createUser = useMutation({
    mutationFn: () =>
      adminFetch('/users', {
        method: 'POST',
        body: JSON.stringify({ ...form, department: form.department || undefined }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setForm({ email: '', password: '', name: '', role: 'EMPLOYEE', department: '' });
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="space-y-6">
      <AdminPanel title="User management" description="Roles, departments, activation — stored in PostgreSQL.">
        <div className="p-4 border-b border-white/5 grid md:grid-cols-2 lg:grid-cols-5 gap-2">
          <input className="rounded-lg px-3 py-2 text-sm bg-slate-900 border border-white/10" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded-lg px-3 py-2 text-sm bg-slate-900 border border-white/10" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input type="password" className="rounded-lg px-3 py-2 text-sm bg-slate-900 border border-white/10" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select className="rounded-lg px-3 py-2 text-sm bg-slate-900 border border-white/10" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => createUser.mutate()} className="rounded-lg bg-emerald-600 text-white text-sm font-semibold px-3 py-2">
            Create user
          </button>
        </div>
        <div className="p-4">
          <AdminDataTable
            columns={[
              { id: 'name', header: 'Name', defaultWidth: 160, cell: (u: UserRow) => u.name },
              { id: 'email', header: 'Email', defaultWidth: 200, cell: (u: UserRow) => u.email },
              { id: 'role', header: 'Role', defaultWidth: 160, cell: (u: UserRow) => u.role.replaceAll('_', ' ') },
              { id: 'department', header: 'Department', defaultWidth: 140, cell: (u: UserRow) => u.department ?? '—' },
              { id: 'lastLogin', header: 'Last login', defaultWidth: 168, cell: (u: UserRow) => (u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN') : '—') },
              {
                id: 'status',
                header: 'Status',
                truncate: false,
                defaultWidth: 110,
                cell: (u: UserRow) => (
                  <button
                    type="button"
                    onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.isActive })}
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${u.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}
                  >
                    {u.isActive ? 'Active' : 'Disabled'}
                  </button>
                ),
              },
            ]}
            rows={data ?? []}
            rowKey={(u) => u.id}
            isLoading={isLoading}
            emptyMessage="No users."
            columnLayout={{ tableId: 'users', requiredVisible: ['name', 'email', 'status'] }}
          />
        </div>
      </AdminPanel>
    </div>
  );
}
