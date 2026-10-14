'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useEffect, useState } from 'react';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const input = useAdminInputClass();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Gold');
  const [weightGrams, setWeightGrams] = useState('');
  const [makingCharge, setMakingCharge] = useState('');
  const [inStock, setInStock] = useState(true);

  const { data } = useQuery({
    queryKey: ['product', id],
    queryFn: () =>
      adminFetch<{ name: string; category: string; weightGrams: string; makingCharge: string; inStock: boolean }>(
        `/products/${id}`,
      ),
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
      setCategory(data.category);
      setWeightGrams(String(data.weightGrams));
      setMakingCharge(String(data.makingCharge));
      setInStock(data.inStock);
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      adminFetch(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          category,
          weightGrams: Number(weightGrams),
          makingCharge: Number(makingCharge),
          inStock,
        }),
      }),
    onSuccess: () => router.push(`/jewellery/${id}`),
  });

  return (
    <AdminPanel title="Edit product">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} className={input} required />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
          {['Gold', 'Silver', 'Diamond', 'Platinum'].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input type="number" step="0.001" value={weightGrams} onChange={(e) => setWeightGrams(e.target.value)} className={input} required />
        <input type="number" value={makingCharge} onChange={(e) => setMakingCharge(e.target.value)} className={input} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock
        </label>
        <AdminBtnPrimary type="submit">Update</AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
