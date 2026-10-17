'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminBtnPrimary } from '@/components/admin/AdminForm';

type BoardQuote = {
  description: 'GOLD' | 'SILVER';
  buying: number;
  selling: number;
  high: number;
  low: number;
};

type BoardStatus = {
  health: 'fresh' | 'stale' | 'unavailable' | 'updating';
  isLive: boolean;
  fetchedAt: string | null;
  lastError: string | null;
  unitLabel: string;
  rows: Array<BoardQuote | null>;
};

type KjplStatus = {
  health: 'fresh' | 'stale' | 'error' | 'unavailable' | 'updating';
  enabled: boolean;
  updating?: boolean;
  board?: BoardStatus;
};

type Notification = { id: string; title: string; body: string; readAt: string | null };

function inr(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '—';
  const whole = Number.isInteger(n);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function when(iso: string | null | undefined) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
}

function boardLabel(board: BoardStatus | undefined, pending: boolean) {
  if (pending || board?.health === 'updating') return 'Updating';
  if (!board || board.health === 'unavailable') return 'Unavailable';
  if (board.health === 'stale' || !board.isLive) return 'Stale';
  return 'Live';
}

export default function GoldRatesPage() {
  const qc = useQueryClient();
  const kjpl = useQuery({
    queryKey: ['kjpl-status'],
    queryFn: () => adminFetch<KjplStatus>('/kjpl-rates/status'),
    refetchInterval: 60_000,
  });
  const notifications = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminFetch<Notification[]>('/notifications'),
  });
  const alert = (notifications.data ?? []).find(
    (n) => !n.readAt && n.body.includes('[JEWELLERY_KJPL]') && n.title.includes('Failed'),
  );

  const refresh = useMutation({
    mutationFn: () =>
      adminFetch<{ ok: boolean; message: string; boardOk?: boolean; boardMessage?: string }>('/kjpl-rates/refresh', {
        method: 'POST',
      }),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['kjpl-status'] });
      void qc.invalidateQueries({ queryKey: ['gold-rates-history'] });
      void qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      void qc.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const status = kjpl.data;
  const board = status?.board;
  const label = boardLabel(board, refresh.isPending || Boolean(status?.updating));
  const tone =
    label === 'Live'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : label === 'Updating'
        ? 'bg-amber-50 text-amber-900 border-amber-200'
        : 'bg-red-50 text-red-800 border-red-200';
  const byName = new Map((board?.rows ?? []).filter((row): row is BoardQuote => row != null).map((row) => [row.description, row]));
  const showValues = label === 'Live' || label === 'Stale' || label === 'Updating';

  return (
    <div className="max-w-4xl space-y-4 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
          <p className="mt-2 text-xs text-slate-500">KJPL market board · Last update {when(board?.fetchedAt)}</p>
        </div>
        <AdminBtnPrimary type="button" disabled={refresh.isPending || status?.enabled === false} onClick={() => refresh.mutate()}>
          {refresh.isPending ? 'Refreshing…' : 'Refresh'}
        </AdminBtnPrimary>
      </div>

      {label === 'Stale' ? (
        <p className="text-sm text-red-800">Showing the last valid board. These values are not live.</p>
      ) : null}
      {label === 'Unavailable' ? <p className="text-sm text-red-800">Market board is unavailable. No current rates are shown.</p> : null}
      {board?.lastError && label !== 'Live' ? <p className="text-xs text-red-700">{board.lastError}</p> : null}
      {alert ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          <p className="font-semibold">{alert.title}</p>
          <p className="mt-1 whitespace-pre-line text-xs">{alert.body.replace(/^\[JEWELLERY_KJPL\]\n?/, '')}</p>
        </div>
      ) : null}
      {refresh.isError ? <p className="text-sm text-red-700">{(refresh.error as Error).message}</p> : null}
      {refresh.data && !refresh.data.ok ? <p className="text-sm text-red-700">Shop billing rates: {refresh.data.message}</p> : null}
      {refresh.data?.boardOk === false ? <p className="text-sm text-red-700">Market board: {refresh.data.boardMessage}</p> : null}

      {kjpl.isLoading ? <p className="text-sm text-slate-500">Loading rates…</p> : null}
      {kjpl.isError ? <p className="text-sm text-red-700">Rates could not be loaded.</p> : null}

      <div className="min-w-0 overflow-x-auto rounded-md border border-amber-300 bg-[#fffdf8]">
        <table className="w-full border-collapse text-xs text-slate-900 sm:text-sm">
          <thead>
            <tr className="bg-amber-50 text-[11px] uppercase tracking-wide text-amber-950">
              <th className="w-[22%] border border-amber-200 px-2 py-2 text-left font-semibold sm:px-3">Description</th>
              <th className="w-[26%] border border-amber-200 px-2 py-2 text-right font-semibold sm:px-3">Buying Rate</th>
              <th className="w-[26%] border border-amber-200 px-2 py-2 text-right font-semibold sm:px-3">Selling Rate</th>
              <th className="w-[26%] border border-amber-200 px-2 py-2 text-right font-semibold sm:px-3">High / Low</th>
            </tr>
          </thead>
          <tbody>
            {(['GOLD', 'SILVER'] as const).map((name) => {
              const row = showValues ? byName.get(name) : undefined;
              return (
                <tr key={name} className="bg-white">
                  <th className="border border-amber-200 px-2 py-2.5 text-left text-sm font-semibold text-slate-900 sm:px-3">{name}</th>
                  <td className="whitespace-nowrap border border-amber-200 px-2 py-2.5 text-right font-medium tabular-nums sm:px-3">{inr(row?.buying)}</td>
                  <td className="whitespace-nowrap border border-amber-200 px-2 py-2.5 text-right font-medium tabular-nums sm:px-3">{inr(row?.selling)}</td>
                  <td className="whitespace-nowrap border border-amber-200 px-2 py-2.5 text-right tabular-nums sm:px-3">
                    <span className="block font-medium">
                      <span className="mr-1 text-[10px] font-semibold uppercase text-amber-800">High</span>
                      {inr(row?.high)}
                    </span>
                    <span className="block text-slate-700">
                      <span className="mr-1 text-[10px] font-semibold uppercase text-amber-800">Low</span>
                      {inr(row?.low)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500">{board?.unitLabel ?? 'INR · KJPL board quote'} · Reference rates only. Shop billing rates are unchanged.</p>
    </div>
  );
}
