'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { useBusiness } from '@/components/admin/BusinessContext';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable';
import { formatRate } from '@/lib/format-inr';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { canWriteCommission } from '@/lib/admin-permissions';

type Broker = {
  id: string;
  code: string | null;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  isActive: boolean;
  commissionKind: string | null;
  commissionRate: string | null;
  _count: { commissions: number; properties: number };
};

type PageResp = { data: Broker[]; page: number; pageSize: number; total: number; totalPages: number };

export default function BrokersPage() {
  const { business, setBusiness } = useBusiness();
  const { user } = useAdminAuth();
  const canEdit = canWriteCommission(user?.role);
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    code: '',
    address: '',
    commissionKind: '' as '' | 'PERCENTAGE' | 'FIXED',
    commissionRate: '',
  });
  const [error, setError] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ['brokers-paged', page, pageSize, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (search) params.set('q', search);
      return adminFetch<PageResp>(`/erp/brokers?${params}`);
    },
    enabled: business === 'real-estate',
  });

  const create = useMutation({
    mutationFn: () =>
      adminFetch('/erp/brokers', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          code: form.code || undefined,
          address: form.address || undefined,
          commissionKind: form.commissionKind || undefined,
          commissionRate: form.commissionRate ? Number(form.commissionRate) : undefined,
        }),
      }),
    onSuccess: () => {
      setShowForm(false);
      setForm({ name: '', phone: '', email: '', code: '', address: '', commissionKind: '', commissionRate: '' });
      void qc.invalidateQueries({ queryKey: ['brokers-paged'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save broker'),
  });

  const columns = useMemo<AdminDataTableColumn<Broker>[]>(
    () => [
      { id: 'name', header: 'Name', cell: (b) => <Link href={`/brokers/${b.id}`} className="font-medium text-blue-700 hover:underline">{b.name}</Link> },
      { id: 'code', header: 'Code', cell: (b) => b.code ?? '—' },
      { id: 'phone', header: 'Phone', cell: (b) => b.phone },
      {
        id: 'rate',
        header: 'Custom rate',
        cell: (b) =>
          b.commissionKind && b.commissionRate != null ? formatRate(b.commissionKind, b.commissionRate) : 'Default',
      },
      { id: 'status', header: 'Status', cell: (b) => (b.isActive ? 'Active' : 'Inactive') },
      { id: 'commissions', header: 'Commissions', cell: (b) => String(b._count.commissions) },
    ],
    [],
  );

  if (business === 'jewellery') {
    return (
      <AdminPanel title="Brokers">
        <div className="p-6 text-sm text-slate-600">
          Broker commissions belong to Real Estate.{' '}
          <button type="button" className="text-blue-700 font-semibold" onClick={() => setBusiness('real-estate')}>
            Switch to Real Estate
          </button>
        </div>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel
      title="Brokers"
      description="Manage broker profiles and commission rates."
      actions={
        canEdit ? (
          <button type="button" className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Close' : 'Add broker'}
          </button>
        ) : null
      }
    >
      <div className="p-4 space-y-4">
        {showForm && canEdit ? (
          <form
            className="grid gap-3 md:grid-cols-3 rounded-xl border p-4 bg-slate-50/80"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              create.mutate();
            }}
          >
            <input required placeholder="Broker name" className="rounded-lg border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="Phone" className="rounded-lg border px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input placeholder="Broker code" className="rounded-lg border px-3 py-2" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input placeholder="Email" className="rounded-lg border px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Address" className="rounded-lg border px-3 py-2 md:col-span-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <select className="rounded-lg border px-3 py-2" value={form.commissionKind} onChange={(e) => setForm({ ...form, commissionKind: e.target.value as typeof form.commissionKind })}>
              <option value="">Default rate</option>
              <option value="PERCENTAGE">Percentage override</option>
              <option value="FIXED">Fixed override</option>
            </select>
            <input placeholder="Override rate" type="number" min={0} className="rounded-lg border px-3 py-2" value={form.commissionRate} onChange={(e) => setForm({ ...form, commissionRate: e.target.value })} />
            <button type="submit" className="rounded-lg bg-emerald-700 text-white font-semibold py-2" disabled={create.isPending}>
              Save broker
            </button>
            {error ? <p className="md:col-span-3 text-sm text-red-700">{error}</p> : null}
          </form>
        ) : null}

        <AdminDataTable
          columns={columns}
          rows={list.data?.data ?? []}
          rowKey={(b) => b.id}
          isLoading={list.isLoading}
          emptyMessage="No brokers found."
          maxHeightClass="max-h-[min(65vh,640px)]"
          columnLayout={{ tableId: 'brokers', pinnedOrder: ['name'], requiredVisible: ['name'] }}
          toolbar={
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                placeholder="Search brokers…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearch(q.trim());
                    setPage(1);
                  }
                }}
              />
              <button type="button" className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={() => { setSearch(q.trim()); setPage(1); }}>
                Search
              </button>
            </div>
          }
          pagination={
            list.data
              ? {
                  page: list.data.page,
                  pageSize: list.data.pageSize,
                  total: list.data.total,
                  totalPages: list.data.totalPages,
                  onPageChange: setPage,
                  onPageSizeChange: (s) => {
                    setPageSize(s);
                    setPage(1);
                  },
                }
              : undefined
          }
        />
        <p className="text-xs text-slate-500 px-1">
          <Link href="/commissions" className="text-blue-700 hover:underline">
            Open commission management →
          </Link>
        </p>
      </div>
    </AdminPanel>
  );
}
