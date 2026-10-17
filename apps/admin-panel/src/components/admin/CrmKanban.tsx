'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '../../lib/admin-api';
import { clsx } from 'clsx';
import { useAdminTheme } from './AdminShell';

const COLUMNS = ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED', 'NEGOTIATION', 'WON', 'LOST'] as const;

type Lead = {
  id: string;
  name: string;
  phone: string;
  site: string;
  status: string;
  createdAt: string;
};

export function CrmKanban({ leads }: { leads: Lead[] }) {
  const theme = useAdminTheme();
  const dark = theme === 'dark';
  const qc = useQueryClient();

  const patch = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-leads'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
      {COLUMNS.map((col) => {
        const items = leads.filter((l) => l.status === col);
        return (
          <div
            key={col}
            className={clsx(
              'snap-start shrink-0 w-[min(100%,17rem)] rounded-2xl border p-3 min-h-[320px]',
              dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50',
            )}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500">{col}</h3>
              <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', dark ? 'bg-white/10' : 'bg-white')}>
                {items.length}
              </span>
            </div>
            <ul className="space-y-2">
              {items.map((l) => (
                <li
                  key={l.id}
                  className={clsx(
                    'rounded-xl border p-3 text-sm shadow-sm transition-shadow hover:shadow-md',
                    dark ? 'border-white/10 bg-slate-900/80' : 'border-slate-200 bg-white',
                  )}
                >
                  <p className="font-semibold truncate">{l.name}</p>
                  <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{l.phone}</p>
                  <p className="text-[10px] uppercase mt-2 text-emerald-600">{l.site}</p>
                  <select
                    className={clsx(
                      'mt-3 w-full rounded-lg text-xs px-2 py-1.5 border',
                      dark ? 'bg-slate-950 border-white/10' : 'bg-slate-50 border-slate-200',
                    )}
                    value={l.status}
                    onChange={(e) => patch.mutate({ id: l.id, status: e.target.value })}
                  >
                    {COLUMNS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
