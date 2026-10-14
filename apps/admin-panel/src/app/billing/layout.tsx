'use client';

import { clsx } from 'clsx';
import { useAdminTheme } from '@/components/admin/AdminShell';

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  const dark = useAdminTheme() === 'dark';
  return (
    <div
      className={clsx(
        'min-h-full -mx-2 sm:-mx-0 px-2 sm:px-0 pb-4 rounded-none sm:rounded-xl',
        dark ? '' : 'bg-gradient-to-b from-stone-100/80 via-amber-50/20 to-stone-50/90',
      )}
    >
      {children}
    </div>
  );
}
