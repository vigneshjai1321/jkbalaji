'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { useBusiness } from '@/components/admin/BusinessContext';

type Broker = { id: string; name: string; phone: string; email: string | null; isActive: boolean; _count: { commissions: number; properties: number } };
type Commission = {
  id: string;
  kind: string;
  rate: string;
  expectedInr: string;
  paidInr: string;
  status: string;
  broker: { name: string };
  property: { title: string } | null;
  project: { name: string } | null;
};

export default function BrokersPage() {
  const { business, setBusiness } = useBusiness();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const brokers = useQuery({ queryKey: ['brokers'], queryFn: () => adminFetch<Broker[]>('/erp/brokers') });
  const commissions = useQuery({ queryKey: ['commissions'], queryFn: () => adminFetch<Commission[]>('/erp/commissions') });
  const create = useMutation({
    mutationFn: () => adminFetch('/erp/brokers', { method: 'POST', body: JSON.stringify({ name, phone }) }),
    onSuccess: () => {
      setName('');
      setPhone('');
      void qc.invalidateQueries({ queryKey: ['brokers'] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'Could not save the broker'),
  });

  if (business === 'jewellery') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Brokers</h1>
        <p className="mt-2 text-sm text-slate-600">Broker commissions belong to Real Estate. Switch the business to see them.</p>
        <button type="button" className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => setBusiness('real-estate')}>
          Show Real Estate
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] space-y-5">
      <h1 className="text-2xl font-bold">Brokers and commissions</h1>
      <p className="text-sm text-slate-600">Expected commission is not treated as money received. Outstanding is expected minus paid.</p>
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          create.mutate();
        }}
      >
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Broker name" className="rounded-lg border px-3 py-2.5 text-sm" />
        <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border px-3 py-2.5 text-sm" />
        <button className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white" disabled={create.isPending}>
          Add broker
        </button>
        {error ? <p className="md:col-span-3 text-sm text-red-700">{error}</p> : null}
      </form>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Brokers</h2>
        {brokers.isLoading ? <p className="mt-3 text-sm text-slate-500">Loading…</p> : null}
        <ul className="mt-3 divide-y text-sm">
          {(brokers.data ?? []).map((broker) => (
            <li key={broker.id} className="py-2.5">
              <span className="font-medium">{broker.name}</span> · {broker.phone} · {broker._count.commissions} commissions · {broker._count.properties} properties
            </li>
          ))}
          {!brokers.isLoading && (brokers.data ?? []).length === 0 ? <li className="py-3 text-slate-500">No brokers yet.</li> : null}
        </ul>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Commission records</h2>
        <ul className="mt-3 divide-y text-sm">
          {(commissions.data ?? []).map((row) => (
            <li key={row.id} className="py-2.5">
              {row.broker.name}: expected ₹{Number(row.expectedInr).toLocaleString('en-IN')}, paid ₹{Number(row.paidInr).toLocaleString('en-IN')} ({row.status})
              {row.property ? ` · ${row.property.title}` : ''}
              {row.project ? ` · ${row.project.name}` : ''}
            </li>
          ))}
          {!commissions.isLoading && (commissions.data ?? []).length === 0 ? <li className="py-3 text-slate-500">No commission agreements yet. Nothing is counted as outstanding.</li> : null}
        </ul>
      </section>
    </div>
  );
}
