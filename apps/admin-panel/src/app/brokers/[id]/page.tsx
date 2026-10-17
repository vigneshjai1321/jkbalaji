'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { formatInr, formatRate } from '@/lib/format-inr';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { canWriteCommission } from '@/lib/admin-permissions';

type Detail = {
  id: string;
  code: string | null;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  isActive: boolean;
  commissionKind: string | null;
  commissionRate: string | null;
  effectiveCommission: { kind: string; rate: number; source: string };
  totals: { expected: number; paid: number; outstanding: number };
  commissions: { id: string; expectedInr: string; paidInr: string; status: string; createdAt: string }[];
};

export default function BrokerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAdminAuth();
  const canEdit = canWriteCommission(user?.role);
  const qc = useQueryClient();
  const [msg, setMsg] = useState<string | null>(null);

  const detail = useQuery({
    queryKey: ['broker', id],
    queryFn: () => adminFetch<Detail>(`/erp/brokers/${id}`),
  });

  const patch = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminFetch(`/erp/brokers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      setMsg('Broker updated successfully.');
      void qc.invalidateQueries({ queryKey: ['broker', id] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const b = detail.data;
  if (detail.isLoading) return <p className="p-6 text-sm">Loading…</p>;
  if (!b) return <p className="p-6 text-sm text-red-600">Broker not found.</p>;

  return (
    <AdminPanel
      title={b.name}
      actions={
        <Link href="/brokers" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Brokers
        </Link>
      }
    >
      <div className="p-6 grid lg:grid-cols-2 gap-8 text-sm">
        <section className="space-y-3">
          <h2 className="font-semibold">Profile</h2>
          <dl className="grid grid-cols-2 gap-2">
            <dt className="text-slate-500">Code</dt>
            <dd>{b.code ?? '—'}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd>{b.phone}</dd>
            <dt className="text-slate-500">Email</dt>
            <dd>{b.email ?? '—'}</dd>
            <dt className="text-slate-500">Address</dt>
            <dd>{b.address ?? '—'}</dd>
            <dt className="text-slate-500">Effective rate</dt>
            <dd>
              {formatRate(b.effectiveCommission.kind, b.effectiveCommission.rate)} ({b.effectiveCommission.source})
            </dd>
            <dt className="text-slate-500">Total commission</dt>
            <dd>{formatInr(b.totals.expected)}</dd>
            <dt className="text-slate-500">Paid</dt>
            <dd>{formatInr(b.totals.paid)}</dd>
            <dt className="text-slate-500">Outstanding</dt>
            <dd className="font-semibold">{formatInr(b.totals.outstanding)}</dd>
          </dl>
          {canEdit ? (
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-2 text-sm"
                onClick={() => patch.mutate({ isActive: !b.isActive })}
              >
                {b.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ) : null}
          {msg ? <p className="text-sm text-slate-600">{msg}</p> : null}
        </section>
        <section>
          <h2 className="font-semibold mb-3">Recent commissions</h2>
          <ul className="divide-y border rounded-xl">
            {b.commissions.map((c) => (
              <li key={c.id} className="p-3 flex justify-between gap-2">
                <Link href={`/commissions/${c.id}`} className="text-blue-700 hover:underline">
                  {formatInr(c.expectedInr)}
                </Link>
                <span className="text-slate-500">{c.status}</span>
              </li>
            ))}
            {b.commissions.length === 0 ? <li className="p-4 text-slate-500">No commissions yet.</li> : null}
          </ul>
        </section>
      </div>
    </AdminPanel>
  );
}
