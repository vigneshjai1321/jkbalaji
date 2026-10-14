'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminRowActions } from '@/components/admin/AdminRowActions';

type Customer = { id: string; name: string; phone: string; email: string | null; gstin: string | null };

export default function AdminCustomersPage() {
  const { data, isLoading } = useQuery({
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
      {isLoading ? (
        <div className="p-8 text-sm opacity-60">Loading…</div>
      ) : (
        <AdminTable
          headers={['Name', 'Phone', 'Email', 'GSTIN', 'Actions']}
          rows={(data ?? []).map((c) => [
            c.name,
            c.phone,
            c.email ?? '—',
            c.gstin ?? '—',
            <AdminRowActions key={c.id} base="/customers" id={c.id} />,
          ])}
        />
      )}
    </AdminPanel>
  );
}
