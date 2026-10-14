'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminRowActions } from '@/components/admin/AdminRowActions';

type Expense = { id: string; category: string; amountInr: string; description: string | null; expenseDate: string };

export default function ExpensesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['erp-expenses'],
    queryFn: () => adminFetch<Expense[]>('/erp/expenses'),
  });

  const total = (data ?? []).reduce((s, e) => s + Number(e.amountInr), 0);

  return (
    <AdminPanel
      title="Expense Management"
      description={`Operating expenses — month total ₹${total.toLocaleString('en-IN')}`}
      actions={
        <Link href="/expenses/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Add expense
        </Link>
      }
    >
      {isLoading ? (
        <div className="p-8 text-sm opacity-60">Loading…</div>
      ) : (
        <AdminTable
          headers={['Date', 'Category', 'Amount', 'Description', 'Actions']}
          rows={(data ?? []).map((e) => [
            new Date(e.expenseDate).toLocaleDateString('en-IN'),
            e.category,
            `₹${Number(e.amountInr).toLocaleString('en-IN')}`,
            e.description ?? '—',
            <AdminRowActions key={e.id} base="/expenses" id={e.id} />,
          ])}
        />
      )}
    </AdminPanel>
  );
}
