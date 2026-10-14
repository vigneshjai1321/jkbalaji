'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useState } from 'react';

export default function NewProductPage() {
  const router = useRouter();
  const input = useAdminInputClass();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Gold');
  const [weightGrams, setWeightGrams] = useState('');
  const [makingCharge, setMakingCharge] = useState('');

  const create = useMutation({
    mutationFn: () =>
      adminFetch<{ id: string }>('/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          category,
          weightGrams: Number(weightGrams),
          makingCharge: Number(makingCharge),
          inStock: true,
        }),
      }),
    onSuccess: (row) => router.push(`/jewellery/${row.id}`),
  });

  return (
    <AdminPanel title="Add product">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className={input} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
          {['Gold', 'Silver', 'Diamond', 'Platinum'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="number" step="0.001" placeholder="Weight (g)" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} className={input} required />
        <input type="number" placeholder="Making charge" value={makingCharge} onChange={(e) => setMakingCharge(e.target.value)} className={input} required />
        <AdminBtnPrimary type="submit">Save product</AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
