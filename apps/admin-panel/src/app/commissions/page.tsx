'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAuthHeaders, adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable';
import { formatInr, formatRate } from '@/lib/format-inr';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { canWriteCommission } from '@/lib/admin-permissions';

type CommissionRow = {
  id: string;
  kind: string;
  rate: string;
  rateSource: string;
  expectedInr: string;
  paidInr: string;
  outstandingInr: number;
  status: string;
  createdAt: string;
  broker: { id: string; name: string };
  project: { id: string; name: string } | null;
  plot: { plotNumber: string } | null;
  plotQuotation: { id: string } | null;
};

type PageResp = {
  data: CommissionRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function CommissionsPage() {
  const { user } = useAdminAuth();
  const canExport = canWriteCommission(user?.role);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState('createdAt:desc');
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [outstandingOnly, setOutstandingOnly] = useState(false);

  const queryKey = ['commissions', page, pageSize, sort, search, status, outstandingOnly];
  const list = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sort,
      });
      if (search) params.set('q', search);
      if (status) params.set('status', status);
      if (outstandingOnly) params.set('outstandingOnly', '1');
      return adminFetch<PageResp>(`/commissions?${params}`);
    },
  });

  const columns = useMemo<AdminDataTableColumn<CommissionRow>[]>(
    () => [
      { id: 'id', header: 'ID', sortable: true, cell: (r) => <span className="font-mono text-xs">{r.id.slice(0, 8)}…</span> },
      { id: 'name', header: 'Broker', sortable: true, cell: (r) => r.broker.name },
      { id: 'project', header: 'Project', cell: (r) => r.project?.name ?? '—' },
      { id: 'plot', header: 'Plot', cell: (r) => r.plot?.plotNumber ?? '—' },
      { id: 'rate', header: 'Rate', cell: (r) => formatRate(r.kind, r.rate) },
      { id: 'expectedInr', header: 'Commission', sortable: true, cell: (r) => formatInr(r.expectedInr) },
      { id: 'paidInr', header: 'Paid', sortable: true, cell: (r) => formatInr(r.paidInr) },
      { id: 'out', header: 'Outstanding', cell: (r) => formatInr(r.outstandingInr) },
      { id: 'status', header: 'Status', sortable: true, cell: (r) => r.status },
      { id: 'createdAt', header: 'Created', sortable: true, cell: (r) => new Date(r.createdAt).toLocaleDateString('en-IN') },
      {
        id: 'actions',
        header: 'Actions',
        truncate: false,
        defaultWidth: 88,
        cell: (r) => (
          <Link href={`/commissions/${r.id}`} className="text-blue-700 font-medium hover:underline">
            View
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <AdminPanel
      title="Commission management"
      description="Manage broker commissions and payments."
      actions={
        canExport ? (
          <button
            type="button"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={async () => {
              const params = new URLSearchParams();
              if (status) params.set('status', status);
              if (outstandingOnly) params.set('outstandingOnly', '1');
              const base = typeof window !== 'undefined' ? `${window.location.origin}/api/v1` : '';
              const res = await fetch(`${base}/admin/commissions/export?${params}`, {
                headers: adminAuthHeaders(),
              });
              if (!res.ok) return;
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'commissions.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export CSV
          </button>
        ) : null
      }
    >
      <div className="p-4 space-y-4">
        <AdminDataTable
          columns={columns}
          rows={list.data?.data ?? []}
          rowKey={(r) => r.id}
          sort={sort}
          onSortChange={(s) => {
            setSort(s);
            setPage(1);
          }}
          isLoading={list.isLoading}
          error={list.error ? 'Unable to load commissions. Try again.' : null}
          emptyMessage="No commissions found. Try changing your filters."
          maxHeightClass="max-h-[min(70vh,720px)]"
          columnLayout={{ tableId: 'commissions', pinnedOrder: ['actions'], requiredVisible: ['actions'] }}
          toolbar={
            <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
              <label className="flex-1 text-sm">
                <span className="text-slate-600">Search</span>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="Search brokers, plots, ID…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setSearch(q.trim());
                      setPage(1);
                    }
                  }}
                />
              </label>
              <label className="text-sm">
                <span className="text-slate-600">Status</span>
                <select
                  className="mt-1 block rounded-lg border px-3 py-2"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All</option>
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                </select>
              </label>
              <label className="inline-flex items-center gap-2 text-sm pb-2">
                <input
                  type="checkbox"
                  checked={outstandingOnly}
                  onChange={(e) => {
                    setOutstandingOnly(e.target.checked);
                    setPage(1);
                  }}
                />
                Outstanding only
              </label>
              <button
                type="button"
                className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-semibold"
                onClick={() => {
                  setSearch(q.trim());
                  setPage(1);
                }}
              >
                Apply
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
      </div>
    </AdminPanel>
  );
}
