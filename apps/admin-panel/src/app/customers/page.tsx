'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminRowActions } from '@/components/admin/AdminRowActions';

type Customer = { id: string; name: string; phone: string; email: string | null; gstin: string | null };

const columns: AdminDataTableColumn<Customer>[] = [
  { id: 'name', header: 'Name', defaultWidth: 180, cell: (c) => <span title={c.name}>{c.name}</span> },
  { id: 'phone', header: 'Phone', defaultWidth: 140, cell: (c) => c.phone },
  { id: 'email', header: 'Email', defaultWidth: 200, cell: (c) => c.email ?? '—' },
  { id: 'gstin', header: 'GSTIN', defaultWidth: 160, cell: (c) => c.gstin ?? '—' },
  { id: 'actions', header: 'Actions', truncate: false, defaultWidth: 120, cell: (c) => <AdminRowActions base="/customers" id={c.id} /> },
];

export default function AdminCustomersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['billing-customers-list'],
    queryFn: () => adminFetch<Customer[]>('/billing/customers'),
  });

  return (
    <AdminPanel
      title="Customers"
      description="360° CRM & billing profiles."
      actions={
        <Link href="/customers/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          New customer
        </Link>
      }
    >
      <div className="p-4">
        <AdminDataTable
          columns={columns}
          rows={data ?? []}
          rowKey={(c) => c.id}
          isLoading={isLoading}
          error={isError ? 'Could not load customers.' : null}
          emptyMessage="No customers yet."
          columnLayout={{ tableId: 'customers', pinnedOrder: ['actions'], requiredVisible: ['actions', 'name'] }}
        />
      </div>
    </AdminPanel>
  );
}
