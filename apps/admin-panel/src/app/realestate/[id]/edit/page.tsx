'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useEffect, useState } from 'react';

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const input = useAdminInputClass();
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [priceInr, setPriceInr] = useState('');

  const { data } = useQuery({
    queryKey: ['property', id],
    queryFn: () =>
      adminFetch<{ title: string; location: string; status: string; priceInr: string }>(`/properties/${id}`),
  });

  useEffect(() => {
    if (data) {
      setTitle(data.title);
      setLocation(data.location);
      setStatus(data.status);
      setPriceInr(String(data.priceInr));
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      adminFetch(`/properties/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, location, status, priceInr: Number(priceInr) }),
      }),
    onSuccess: () => router.push(`/realestate/${id}`),
  });

  return (
    <AdminPanel title="Edit property">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} required />
        <input value={location} onChange={(e) => setLocation(e.target.value)} className={input} required />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={input}>
          {['AVAILABLE', 'BOOKED', 'SOLD'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input type="number" value={priceInr} onChange={(e) => setPriceInr(e.target.value)} className={input} required />
        <AdminBtnPrimary type="submit">Update</AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
