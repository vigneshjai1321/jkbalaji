'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminBtnPrimary, useAdminInputClass } from '@/components/admin/AdminForm';

type Rate = { id: string; rate22k: string; rate24k: string; effectiveDate: string };

type MarketRates = {
  provider: string;
  fetchedAt: string | null;
  isStale: boolean;
  staleMessage: string | null;
  configured: boolean;
  schedulerEnabled: boolean;
  gold: {
    price24kPerGram: number | null;
    price22kPerGram: number | null;
    price18kPerGram: number | null;
  } | null;
  silver: { pricePerGram: number | null } | null;
  usage: { yearMonth: string; requestCount: number; monthlyLimit: number };
};

type GoldApiStatus = {
  configured: boolean;
  schedulerEnabled: boolean;
  market: MarketRates;
  usage: MarketRates['usage'];
};

function fmt(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function GoldRatesPage() {
  const qc = useQueryClient();
  const input = useAdminInputClass();
  const [rate22k, setRate22k] = useState('');
  const [rate24k, setRate24k] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const history = useQuery({
    queryKey: ['gold-rates-history'],
    queryFn: () => adminFetch<Rate[]>('/gold-rates'),
  });

  const goldApi = useQuery({
    queryKey: ['goldapi-status'],
    queryFn: () => adminFetch<GoldApiStatus>('/goldapi/status'),
  });

  const create = useMutation({
    mutationFn: () =>
      adminFetch('/gold-rates', {
        method: 'POST',
        body: JSON.stringify({ rate22k: Number(rate22k), rate24k: Number(rate24k) }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gold-rates-history'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setRate22k('');
      setRate24k('');
    },
  });

  const verify = useMutation({
    mutationFn: () => adminFetch<{ gold: boolean; silver: boolean; message: string }>('/goldapi/verify', { method: 'POST' }),
    onSuccess: (r) => {
      setActionMsg(r.message);
      qc.invalidateQueries({ queryKey: ['goldapi-status'] });
    },
  });

  const sync = useMutation({
    mutationFn: () => adminFetch<{ ok: boolean; message: string }>('/goldapi/sync', { method: 'POST' }),
    onSuccess: (r) => {
      setActionMsg(r.message);
      qc.invalidateQueries({ queryKey: ['goldapi-status'] });
    },
  });

  const latest = history.data?.[0];
  const market = goldApi.data?.market;

  return (
    <div className="space-y-6">
      <AdminPanel
        title="GoldAPI Market Benchmarks"
        description="Cached from GoldAPI.io once daily (09:00 IST). Billing uses shop rates below — not these benchmarks."
      >
        {goldApi.isLoading ? <p className="p-6 text-sm opacity-70">Loading market data…</p> : null}
        {market ? (
          <>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                <dt className="text-xs font-medium text-amber-700">24K benchmark / g</dt>
                <dd className="text-2xl font-bold mt-2">{fmt(market.gold?.price24kPerGram ?? null)}</dd>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                <dt className="text-xs font-medium text-amber-700">22K benchmark / g</dt>
                <dd className="text-2xl font-bold mt-2">{fmt(market.gold?.price22kPerGram ?? null)}</dd>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                <dt className="text-xs font-medium text-amber-700">18K benchmark / g</dt>
                <dd className="text-2xl font-bold mt-2">{fmt(market.gold?.price18kPerGram ?? null)}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 p-5">
                <dt className="text-xs font-medium opacity-70">Silver / g</dt>
                <dd className="text-2xl font-bold mt-2">{fmt(market.silver?.pricePerGram ?? null)}</dd>
              </div>
            </dl>
            <div className="px-6 pb-4 text-sm space-y-1 opacity-80">
              <p>
                Provider: {market.provider}
                {market.fetchedAt
                  ? ` · Last fetch ${new Date(market.fetchedAt).toLocaleString('en-IN')}`
                  : ' · No successful fetch yet'}
              </p>
              <p>
                API usage ({market.usage.yearMonth}): {market.usage.requestCount} / {market.usage.monthlyLimit} requests
              </p>
              <p>
                Token configured: {market.configured ? 'Yes' : 'No'} · Auto scheduler:{' '}
                {market.schedulerEnabled ? 'Enabled' : 'Disabled until XAU & XAG verify'}
              </p>
              {market.isStale && market.staleMessage ? (
                <p className="text-amber-400">{market.staleMessage}</p>
              ) : null}
            </div>
          </>
        ) : null}
        <div className="flex flex-wrap gap-3 p-6 border-t border-white/5">
          <AdminBtnPrimary type="button" onClick={() => verify.mutate()} disabled={verify.isPending}>
            Verify GoldAPI Access
          </AdminBtnPrimary>
          <button
            type="button"
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium hover:bg-white/5"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
          >
            Run Fetch Now
          </button>
          {actionMsg ? <p className="text-sm w-full text-emerald-400/90">{actionMsg}</p> : null}
        </div>
      </AdminPanel>

      <AdminPanel title="Shop Gold Rates (Billing)" description="Manual showroom rates used for invoices and billing.">
        {latest ? (
          <dl className="grid sm:grid-cols-3 gap-6 p-6 text-center">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <dt className="text-xs uppercase tracking-widest text-emerald-600">22K / g</dt>
              <dd className="text-3xl font-bold mt-2">₹{Number(latest.rate22k).toLocaleString('en-IN')}</dd>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <dt className="text-xs uppercase tracking-widest text-emerald-600">24K / g</dt>
              <dd className="text-3xl font-bold mt-2">₹{Number(latest.rate24k).toLocaleString('en-IN')}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 p-6">
              <dt className="text-xs uppercase tracking-widest opacity-60">Effective</dt>
              <dd className="text-lg font-semibold mt-2">{new Date(latest.effectiveDate).toLocaleDateString('en-IN')}</dd>
            </div>
          </dl>
        ) : null}
        <form
          className="grid gap-3 sm:grid-cols-3 p-6 border-t border-white/5"
          onSubmit={(e) => {
            e.preventDefault();
            if (rate22k && rate24k) create.mutate();
          }}
        >
          <input type="number" placeholder="22K shop rate" value={rate22k} onChange={(e) => setRate22k(e.target.value)} className={input} required />
          <input type="number" placeholder="24K shop rate" value={rate24k} onChange={(e) => setRate24k(e.target.value)} className={input} required />
          <AdminBtnPrimary type="submit">Set Shop Rate</AdminBtnPrimary>
        </form>
      </AdminPanel>

      <AdminPanel title="Shop Rate History">
        <AdminTable
          headers={['Date', '22K', '24K']}
          rows={(history.data ?? []).map((r) => [
            new Date(r.effectiveDate).toLocaleDateString('en-IN'),
            `₹${Number(r.rate22k).toLocaleString('en-IN')}`,
            `₹${Number(r.rate24k).toLocaleString('en-IN')}`,
          ])}
        />
      </AdminPanel>
    </div>
  );
}
