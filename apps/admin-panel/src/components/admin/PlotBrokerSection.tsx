'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';
import { clsx } from 'clsx';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';
import { estimateCommissionInr, formatInr } from '@/lib/plot-currency';

type BrokerRow = {
  id: string;
  name: string;
  phone: string;
  code: string | null;
  isActive: boolean;
};

type EffectiveRate = {
  kind: string;
  rate: number;
  source: string;
};

type Props = {
  brokerId: string | null;
  projectId: string;
  onBrokerIdChange: (id: string | null) => void;
  disabled?: boolean;
  basePlotPriceInr?: number | null;
  compact?: boolean;
};

export function PlotBrokerSection({ brokerId, projectId, onBrokerIdChange, disabled, basePlotPriceInr, compact }: Props) {
  const input = useAdminInputClass();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCode, setNewCode] = useState('');
  const [formError, setFormError] = useState('');

  const brokers = useQuery({
    queryKey: ['erp-brokers-active'],
    queryFn: () => adminFetch<BrokerRow[]>('/erp/brokers?active=1'),
  });

  const ratePreview = useQuery({
    queryKey: ['commission-rate-preview', brokerId, projectId],
    queryFn: () =>
      adminFetch<EffectiveRate>(
        `/erp/commission-rate-effective?brokerId=${encodeURIComponent(brokerId!)}&projectId=${encodeURIComponent(projectId)}`,
      ),
    enabled: Boolean(brokerId && projectId),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = (brokers.data ?? []).filter((b) => b.isActive);
    if (!term) return list;
    return list.filter(
      (b) =>
        b.name.toLowerCase().includes(term) ||
        b.phone.includes(term) ||
        (b.code?.toLowerCase().includes(term) ?? false),
    );
  }, [brokers.data, search]);

  const selected = (brokers.data ?? []).find((b) => b.id === brokerId);

  const createBroker = useMutation({
    mutationFn: () =>
      adminFetch<BrokerRow>('/erp/brokers', {
        method: 'POST',
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          code: newCode.trim() || undefined,
        }),
      }),
    onSuccess: (row) => {
      void qc.invalidateQueries({ queryKey: ['erp-brokers-active'] });
      onBrokerIdChange(row.id);
      setShowCreate(false);
      setNewName('');
      setNewPhone('');
      setNewCode('');
      setFormError('');
    },
    onError: (e: Error) => setFormError(e.message),
  });

  const rateSourceLabel =
    ratePreview.data?.source === 'PROJECT'
      ? 'Project override'
      : ratePreview.data?.source === 'BROKER'
        ? 'Broker override'
        : ratePreview.data?.source === 'GLOBAL'
          ? 'Global default (2%)'
          : ratePreview.isError
            ? 'Rate unavailable'
            : '—';

  const estimated =
    ratePreview.data && basePlotPriceInr != null
      ? estimateCommissionInr(ratePreview.data.kind, ratePreview.data.rate, basePlotPriceInr)
      : ratePreview.data?.kind === 'FIXED' && ratePreview.data
        ? estimateCommissionInr(ratePreview.data.kind, ratePreview.data.rate, null)
        : null;

  const pad = compact ? 'p-3 space-y-2' : 'p-4 space-y-3';
  const field = compact ? clsx(input, 'py-1.5 text-sm') : input;

  return (
    <fieldset className={clsx('rounded-xl border border-slate-200 dark:border-white/10', pad, compact && 'col-span-full')} disabled={disabled}>
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-600">Broker & commission preview</legend>
      <p className="text-[11px] text-slate-500">
        Optional plot broker. Estimated commission is indicative only — quotations keep their own commission snapshots.
      </p>

      <div className={clsx('grid gap-2', compact ? 'sm:grid-cols-2' : '')}>
        <label className="block text-xs">
          Search brokers
          <input
            className={clsx(field, 'mt-0.5')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, or code"
          />
        </label>

        <label className="block text-xs">
          Broker
          <select
            className={clsx(field, 'mt-0.5')}
            value={brokerId ?? ''}
            onChange={(e) => onBrokerIdChange(e.target.value ? e.target.value : null)}
          >
          <option value="">None</option>
          {filtered.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {b.code ? ` · ${b.code}` : ''} · {b.phone}
            </option>
          ))}
        </select>
        </label>
      </div>

      {selected ? (
        <div className="text-xs rounded-lg bg-slate-50 dark:bg-white/5 p-2.5 space-y-1">
          <p>
            <span className="font-medium">{selected.name}</span>
            {selected.code ? ` (${selected.code})` : ''} · {selected.phone}
          </p>
          {ratePreview.data ? (
            <p>
              Effective rate:{' '}
              <span className="font-semibold tabular-nums">
                {ratePreview.data.kind === 'PERCENTAGE' ? `${ratePreview.data.rate}%` : formatInr(ratePreview.data.rate)}
              </span>{' '}
              · {rateSourceLabel}
            </p>
          ) : ratePreview.isLoading ? (
            <p className="text-slate-500">Loading rate…</p>
          ) : ratePreview.isError ? (
            <p className="text-amber-800">Commission rate could not be loaded.</p>
          ) : null}
          {estimated != null ? (
            <p className="text-slate-700">
              Estimated commission: <span className="font-semibold tabular-nums">{formatInr(estimated)}</span>
              <span className="text-slate-500"> (not recorded until a quotation commission exists)</span>
            </p>
          ) : brokerId && ratePreview.data?.kind === 'PERCENTAGE' && basePlotPriceInr == null ? (
            <p className="text-slate-500">Enter area and price per sq ft to estimate commission.</p>
          ) : null}
          <Link href={`/brokers/${selected.id}`} className="text-blue-600 hover:underline">
            Broker details
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="text-sm text-blue-600 hover:underline" onClick={() => setShowCreate((v) => !v)}>
          {showCreate ? 'Cancel new broker' : 'New broker'}
        </button>
        {brokerId ? (
          <button type="button" className="text-sm text-slate-600 hover:underline" onClick={() => onBrokerIdChange(null)}>
            Clear broker
          </button>
        ) : null}
      </div>

      {showCreate ? (
        <div className="grid sm:grid-cols-2 gap-3 border-t pt-3">
          <label className="text-sm sm:col-span-2">
            Name
            <input className={`${input} mt-1`} value={newName} onChange={(e) => setNewName(e.target.value)} required />
          </label>
          <label className="text-sm">
            Phone
            <input className={`${input} mt-1`} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} required />
          </label>
          <label className="text-sm">
            Code (optional)
            <input className={`${input} mt-1`} value={newCode} onChange={(e) => setNewCode(e.target.value)} />
          </label>
          {formError ? <p className="sm:col-span-2 text-xs text-red-700">{formError}</p> : null}
          <div className="sm:col-span-2">
            <AdminBtnPrimary
              type="button"
              disabled={createBroker.isPending || newName.trim().length < 2 || newPhone.trim().length < 8}
              onClick={() => createBroker.mutate()}
            >
              Create broker
            </AdminBtnPrimary>
          </div>
        </div>
      ) : null}
    </fieldset>
  );
}
