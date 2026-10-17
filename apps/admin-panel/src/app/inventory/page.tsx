'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';

type Stock = { sku: string; name: string; quantity: string; unit: string };

export default function InventoryPage() {
  const qc = useQueryClient();
  const input = useAdminInputClass();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [delta, setDelta] = useState('');
  const [movement, setMovement] = useState<'IN' | 'OUT' | 'TRANSFER'>('IN');

  const { data, isLoading } = useQuery({
    queryKey: ['erp-inventory'],
    queryFn: () => adminFetch<Stock[]>('/erp/inventory'),
  });

  const adjust = useMutation({
    mutationFn: () =>
      adminFetch('/erp/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({ sku, name, delta: Number(delta), movement }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['erp-inventory'] });
      setDelta('');
    },
  });

  const low = (data ?? []).filter((s) => Number(s.quantity) < 10);

  return (
    <AdminPanel title="Inventory Management" description="Stock in / out / transfer — PostgreSQL.">
      {low.length ? (
        <div className="mx-4 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <strong>{low.length}</strong> SKU(s) below threshold.
        </div>
      ) : null}
      <form
        className="grid gap-3 sm:grid-cols-5 p-4 m-4 rounded-2xl border border-white/10"
        onSubmit={(e) => {
          e.preventDefault();
          if (sku && name && delta) adjust.mutate();
        }}
      >
        <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className={input} required />
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={input} required />
        <select value={movement} onChange={(e) => setMovement(e.target.value as 'IN' | 'OUT' | 'TRANSFER')} className={input}>
          <option value="IN">Stock In</option>
          <option value="OUT">Stock Out</option>
          <option value="TRANSFER">Transfer</option>
        </select>
        <input type="number" placeholder="Qty" value={delta} onChange={(e) => setDelta(e.target.value)} className={input} required />
        <AdminBtnPrimary type="submit" className="w-full">
          Post
        </AdminBtnPrimary>
      </form>
      <div className="px-4 pb-4">
        <AdminDataTable
          columns={[
            { id: 'sku', header: 'SKU', defaultWidth: 140, cell: (s: Stock) => s.sku },
            { id: 'name', header: 'Name', defaultWidth: 200, cell: (s: Stock) => <span title={s.name}>{s.name}</span> },
            { id: 'qty', header: 'Qty', defaultWidth: 90, cell: (s: Stock) => String(s.quantity) },
            { id: 'unit', header: 'Unit', defaultWidth: 90, cell: (s: Stock) => s.unit },
          ]}
          rows={data ?? []}
          rowKey={(s) => s.sku}
          isLoading={isLoading}
          emptyMessage="No stock records."
          columnLayout={{ tableId: 'inventory', requiredVisible: ['sku', 'name'] }}
        />
      </div>
    </AdminPanel>
  );
}
