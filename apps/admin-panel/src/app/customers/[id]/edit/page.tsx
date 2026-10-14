'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useEffect, useState } from 'react';

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const input = useAdminInputClass();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');

  const { data } = useQuery({
    queryKey: ['customer-360', id],
    queryFn: () => adminFetch<{ name: string; phone: string; email: string | null; gstin: string | null }>(`/billing/customers/${id}`),
  });

  useEffect(() => {
    if (data) {
      setName(data.name);
      setPhone(data.phone);
      setEmail(data.email ?? '');
      setGstin(data.gstin ?? '');
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () =>
      adminFetch(`/billing/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name, phone, email: email || undefined, gstin: gstin || undefined }),
      }),
    onSuccess: () => router.push(`/customers/${id}`),
  });

  return (
    <AdminPanel title="Edit customer">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} className={input} required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input value={gstin} onChange={(e) => setGstin(e.target.value)} className={input} />
        <AdminBtnPrimary type="submit">Save</AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
