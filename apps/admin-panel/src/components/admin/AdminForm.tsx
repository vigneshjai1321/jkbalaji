'use client';

import { clsx } from 'clsx';
import { useAdminTheme } from './AdminShell';

export function useAdminInputClass() {
  const dark = useAdminTheme() === 'dark';
  return clsx(
    'w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40',
    dark ? 'bg-slate-900 border-white/10 text-slate-100' : 'bg-white border-slate-200 text-slate-900',
  );
}

export function AdminFormActions({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2 pt-2">{children}</div>;
}

export function AdminBtnPrimary({ children, className, type = 'button', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={clsx('rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50', className)}
    >
      {children}
    </button>
  );
}

export function AdminBtnSecondary({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const dark = useAdminTheme() === 'dark';
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'rounded-xl border px-4 py-2.5 text-sm font-semibold',
        dark ? 'border-white/15 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-50',
        props.className,
      )}
    >
      {children}
    </button>
  );
}
