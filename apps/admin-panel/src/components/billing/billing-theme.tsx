'use client';

import { clsx } from 'clsx';
import { useAdminTheme } from '@/components/admin/AdminShell';

/** Theme-aware billing controls — use instead of hardcoded dark-panel classes on filter bars. */
export function useBillingInputClass(extra?: string) {
  const dark = useAdminTheme() === 'dark';
  return clsx(
    'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-[border-color,box-shadow,background-color]',
    'placeholder:text-stone-400 disabled:cursor-not-allowed disabled:opacity-60',
    dark
      ? 'bg-slate-900 border-white/10 text-slate-100 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/30'
      : 'bg-white border-stone-300 text-stone-900 shadow-sm shadow-stone-200/30 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/25',
    extra,
  );
}

export function useBillingSelectClass(extra?: string) {
  const dark = useAdminTheme() === 'dark';
  return clsx(
    useBillingInputClass(),
    'billing-field-select',
    dark ? 'billing-field-select--dark' : 'billing-field-select--light',
    extra,
  );
}

export function useBillingDateClass(extra?: string) {
  const dark = useAdminTheme() === 'dark';
  return clsx(useBillingInputClass(), dark ? 'billing-field-date--dark' : 'billing-field-date--light', extra);
}

export function useBillingStatCardClass() {
  const dark = useAdminTheme() === 'dark';
  return clsx(
    'rounded-xl border p-4',
    dark ? 'border-white/10 bg-white/[0.03]' : 'border-stone-200/90 bg-white shadow-sm shadow-stone-200/40',
  );
}

export function useBillingFilterBarClass() {
  const dark = useAdminTheme() === 'dark';
  return clsx('p-4 border-b grid gap-3', dark ? 'border-white/5' : 'border-stone-200/80 bg-stone-50/50', 'sm:grid-cols-2 lg:grid-cols-12');
}

export function useBillingLinkClass() {
  const dark = useAdminTheme() === 'dark';
  return dark ? 'text-emerald-400 hover:underline' : 'text-amber-900/90 hover:text-amber-950 font-medium hover:underline';
}

export function useBillingMutedTextClass() {
  const dark = useAdminTheme() === 'dark';
  return dark ? 'text-slate-500' : 'text-stone-600';
}

export function useBillingPagerBtnClass() {
  const dark = useAdminTheme() === 'dark';
  return clsx(
    'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
    dark
      ? 'border-white/10 hover:bg-white/5 text-slate-200'
      : 'border-stone-300 bg-white text-stone-800 hover:bg-stone-50',
  );
}

/** Optional page chrome for billing routes (light jewellery ERP feel). */
export function billingPageChromeClass() {
  return 'space-y-6';
}
