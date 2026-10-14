'use client';

import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useBusiness, type BusinessKey } from './BusinessContext';
import { useAdminTheme } from './AdminShell';

const OPTIONS: { key: BusinessKey; label: string; href: string }[] = [
  { key: 'all', label: 'All Businesses', href: '/' },
  { key: 'real-estate', label: 'Real Estate', href: '/overview/real-estate' },
  { key: 'jewellery', label: 'Gold & Jewellery', href: '/overview/jewellery' },
];

export function BusinessSelector() {
  const { business, setBusiness } = useBusiness();
  const router = useRouter();
  const dark = useAdminTheme() === 'dark';
  const current = OPTIONS.find((o) => o.key === business)?.label ?? 'All Businesses';

  return (
    <div className="relative shrink-0 max-w-[11rem] sm:max-w-none">
      <label className="sr-only" htmlFor="business-select">
        Business
      </label>
      <div className="relative">
        <select
          id="business-select"
          value={business}
          onChange={(e) => {
            const key = e.target.value as BusinessKey;
            const option = OPTIONS.find((o) => o.key === key);
            if (!option) return;
            setBusiness(key);
            router.push(option.href);
          }}
          className={clsx(
            'h-9 appearance-none rounded-lg border pl-3 pr-9 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/30',
            dark ? 'border-white/10 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-800',
          )}
        >
          {OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" aria-hidden />
      </div>
      <span className="sr-only">Current: {current}</span>
    </div>
  );
}
