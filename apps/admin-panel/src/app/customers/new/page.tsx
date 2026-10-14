'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { useState } from 'react';

export default function NewCustomerPage() {
  const router = useRouter();
  const input = useAdminInputClass();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');

  const create = useMutation({
    mutationFn: () =>
      adminFetch<{ id: string }>('/billing/customers', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email: email || undefined, gstin: gstin || undefined }),
      }),
    onSuccess: (row) => router.push(`/customers/${row.id}`),
  });

  return (
    <AdminPanel title="New customer">
      <form
        className="p-6 grid gap-4 max-w-lg"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={input} required />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} required />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
        <input placeholder="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} className={input} />
        <AdminBtnPrimary type="submit">Create customer</AdminBtnPrimary>
      </form>
    </AdminPanel>
  );
}
