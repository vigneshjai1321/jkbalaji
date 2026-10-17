'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAdminTheme } from '@/components/admin/AdminShell';
import { adminFetch } from '@/lib/admin-api';
import { formatRate } from '@/lib/format-inr';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { canEditCommissionSettings } from '@/lib/admin-permissions';

type Settings = {
  defaultKind: string;
  defaultRate: number;
  effectiveKind: string;
  effectiveRate: number;
  rateSource: string;
  updatedAt: string | null;
  changedBy: { name: string } | null;
};

export default function AdminSettingsPage() {
  const theme = useAdminTheme();
  const dark = theme === 'dark';
  const { user } = useAdminAuth();
  const canEdit = canEditCommissionSettings(user?.role);
  const qc = useQueryClient();
  const [kind, setKind] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [rate, setRate] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const settings = useQuery({
    queryKey: ['commission-settings'],
    queryFn: () => adminFetch<Settings>('/commissions/settings'),
  });

  const save = useMutation({
    mutationFn: () =>
      adminFetch('/commissions/settings', {
        method: 'PATCH',
        body: JSON.stringify({ kind, rate: Number(rate) }),
      }),
    onSuccess: () => {
      setMsg('Commission settings saved.');
      void qc.invalidateQueries({ queryKey: ['commission-settings'] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  const s = settings.data;

  return (
    <div className="space-y-6">
      <AdminPanel title="Settings">
        <div className={`p-6 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
          <p className="text-slate-500">Users, SMTP, and website configuration are managed on the server.</p>
        </div>
      </AdminPanel>

      <AdminPanel title="Commission settings" description="Global default rate for new plot quotations.">
        <div className="p-6 space-y-4 text-sm max-w-lg">
          {settings.isLoading ? (
            <p className="text-slate-500">Loading…</p>
          ) : s ? (
            <>
              <dl className="grid grid-cols-2 gap-2">
                <dt className="text-slate-500">Default rate</dt>
                <dd>{formatRate(s.defaultKind, s.defaultRate)}</dd>
                <dt className="text-slate-500">Effective rate</dt>
                <dd>{formatRate(s.effectiveKind, s.effectiveRate)}</dd>
                <dt className="text-slate-500">Rate source</dt>
                <dd>{s.rateSource}</dd>
                <dt className="text-slate-500">Last updated</dt>
                <dd>{s.updatedAt ? new Date(s.updatedAt).toLocaleString('en-IN') : '—'}</dd>
                <dt className="text-slate-500">Updated by</dt>
                <dd>{s.changedBy?.name ?? '—'}</dd>
              </dl>
              {canEdit ? (
                <form
                  className="space-y-3 pt-4 border-t"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setMsg(null);
                    save.mutate();
                  }}
                >
                  <p className="font-medium">Change default rate</p>
                  <select
                    className="w-full rounded-lg border px-3 py-2"
                    value={kind}
                    onChange={(e) => setKind(e.target.value as typeof kind)}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed amount</option>
                  </select>
                  <input
                    required
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Rate"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="rounded-lg bg-blue-700 text-white px-4 py-2 font-semibold" disabled={save.isPending}>
                      Save
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border px-4 py-2"
                      onClick={() => {
                        setKind(s.defaultKind as typeof kind);
                        setRate(String(s.defaultRate));
                        setMsg(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
              {msg ? <p className="text-slate-600">{msg}</p> : null}
            </>
          ) : (
            <p className="text-red-600">Unable to load settings.</p>
          )}
        </div>
      </AdminPanel>
    </div>
  );
}
