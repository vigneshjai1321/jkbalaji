'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPanel } from '@/components/admin/AdminPanel';
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
      <div className="p-4">
        <AdminDataTable
          columns={[
            { id: 'date', header: 'Date', defaultWidth: 120, cell: (e: Expense) => new Date(e.expenseDate).toLocaleDateString('en-IN') },
            { id: 'category', header: 'Category', defaultWidth: 140, cell: (e: Expense) => e.category },
            { id: 'amount', header: 'Amount', defaultWidth: 120, cell: (e: Expense) => `₹${Number(e.amountInr).toLocaleString('en-IN')}` },
            { id: 'description', header: 'Description', defaultWidth: 220, cell: (e: Expense) => e.description ?? '—' },
            { id: 'actions', header: 'Actions', truncate: false, defaultWidth: 120, cell: (e: Expense) => <AdminRowActions base="/expenses" id={e.id} /> },
          ]}
          rows={data ?? []}
          rowKey={(e) => e.id}
          isLoading={isLoading}
          emptyMessage="No expenses yet."
          columnLayout={{ tableId: 'expenses', pinnedOrder: ['actions'], requiredVisible: ['actions'] }}
        />
      </div>
    </AdminPanel>
  );
}
