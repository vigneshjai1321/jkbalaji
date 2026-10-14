'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';

type Expense = { id: string; category: string; amountInr: string; description: string | null; expenseDate: string };

export default function ExpenseViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['erp-expense', id],
    queryFn: () => adminFetch<Expense>(`/erp/expenses/${id}`),
  });

  const del = useMutation({
    mutationFn: () => adminFetch(`/erp/expenses/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp-expenses'] });
      router.push('/expenses');
    },
  });

  if (!data) return <div className="p-8 text-sm opacity-60">Loading…</div>;

  return (
    <AdminPanel
      title="Expense detail"
      actions={
        <div className="flex gap-2">
          <Link href={`/expenses/${id}/edit`} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Edit
          </Link>
          <AdminBtnSecondary onClick={() => del.mutate()}>Delete</AdminBtnSecondary>
        </div>
      }
    >
      <dl className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="opacity-60">Category</dt>
          <dd className="font-semibold">{data.category}</dd>
        </div>
        <div>
          <dt className="opacity-60">Amount</dt>
          <dd className="font-semibold">₹{Number(data.amountInr).toLocaleString('en-IN')}</dd>
        </div>
        <div>
          <dt className="opacity-60">Date</dt>
          <dd className="font-semibold">{new Date(data.expenseDate).toLocaleDateString('en-IN')}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="opacity-60">Description</dt>
          <dd className="font-semibold">{data.description ?? '—'}</dd>
        </div>
      </dl>
    </AdminPanel>
  );
}
