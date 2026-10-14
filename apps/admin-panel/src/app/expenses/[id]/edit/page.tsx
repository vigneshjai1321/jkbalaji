'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useEffect, useState } from 'react';

const CATEGORIES = ['SALARY', 'RENT', 'ELECTRICITY', 'INTERNET', 'MARKETING', 'FUEL', 'TRAVEL', 'OFFICE', 'MISCELLANEOUS'];

export default function EditExpensePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const input = useAdminInputClass();
  const [category, setCategory] = useState('OFFICE');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  const { data } = useQuery({
    queryKey: ['erp-expense', id],
    queryFn: () => adminFetch<{ category: string; amountInr: string; description: string | null }>(`/erp/expenses/${id}`),
  });

  useEffect(() => {
    if (data) {
      setCategory(data.category);
      setAmount(String(data.amountInr));
      setDesc(data.description ?? '');
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      adminFetch(`/erp/expenses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ category, amountInr: Number(amount), description: desc }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp-expenses'] });
      router.push(`/expenses/${id}`);
    },
  });

  return (
    <AdminPanel title="Edit expense">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={input} required />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} className={input} />
        <AdminBtnPrimary type="submit">Update</AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
