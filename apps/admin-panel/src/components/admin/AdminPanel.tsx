'use client';

import { clsx } from 'clsx';
import { useAdminTheme } from './AdminShell';

export function AdminPanel({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const theme = useAdminTheme();
  const dark = theme === 'dark';
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-[1.65rem] font-bold tracking-tight">{title}</h1>
          {description ? <p className={`text-sm md:text-[15px] mt-1.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className={clsx('rounded-2xl border overflow-hidden', dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white')}>
        {children}
      </div>
    </div>
  );
}

export function AdminTable({ headers, rows }: { headers: React.ReactNode[]; rows: React.ReactNode[][] }) {
  const theme = useAdminTheme();
  const dark = theme === 'dark';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm md:text-[0.9375rem]">
        <thead className={dark ? 'bg-white/[0.04] text-slate-400' : 'bg-slate-50 text-slate-600'}>
          <tr>
            {headers.map((h, idx) => (
              <th key={idx} className="text-left font-medium px-4 py-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className={clsx('border-t', dark ? 'border-white/5' : 'border-slate-100')}>
              {cells.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top whitespace-nowrap max-w-[14rem]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? (
        <p className={`px-4 py-8 text-center text-sm ${dark ? 'text-slate-500' : 'text-slate-500'}`}>No records yet.</p>
      ) : null}
    </div>
  );
}
