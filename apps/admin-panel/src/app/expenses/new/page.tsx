'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useState } from 'react';

const CATEGORIES = ['SALARY', 'RENT', 'ELECTRICITY', 'INTERNET', 'MARKETING', 'FUEL', 'TRAVEL', 'OFFICE', 'MISCELLANEOUS'];

export default function NewExpensePage() {
  const router = useRouter();
  const input = useAdminInputClass();
  const [category, setCategory] = useState('OFFICE');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  const create = useMutation({
    mutationFn: () =>
      adminFetch<{ id: string }>('/erp/expenses', {
        method: 'POST',
        body: JSON.stringify({ category, amountInr: Number(amount), description: desc || undefined }),
      }),
    onSuccess: (row) => router.push(`/expenses/${row.id}`),
  });

  return (
    <AdminPanel title="Add expense">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          if (amount) create.mutate();
        }}
      >
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="number" placeholder="Amount (INR)" value={amount} onChange={(e) => setAmount(e.target.value)} className={input} required />
        <input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className={input} />
        <AdminBtnPrimary type="submit">Save expense</AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
