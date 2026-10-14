'use client';

import Link from 'next/link';
import { Building2, Gem, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import type { DashboardOverview } from '@/lib/admin-api';
import { useBusiness } from './BusinessContext';

export type OverviewScope = 'all' | 'real-estate' | 'jewellery';

const CARDS: {
  key: OverviewScope;
  href: string;
  title: string;
  description: string;
  icon: typeof Building2;
}[] = [
  {
    key: 'real-estate',
    href: '/overview/real-estate',
    title: 'Real Estate',
    description: 'Plot and property enquiries from jkbalaji.in.',
    icon: Building2,
  },
  {
    key: 'jewellery',
    href: '/overview/jewellery',
    title: 'Gold & Jewellery',
    description: 'Showroom and savings-scheme enquiries from cheyyarbalaji.com.',
    icon: Gem,
  },
  {
    key: 'all',
    href: '/',
    title: 'All Businesses',
    description: 'Combined view of the businesses you are authorized to manage.',
    icon: LayoutGrid,
  },
];

function summary(key: OverviewScope, units: DashboardOverview['businessUnits'] | undefined) {
  if (!units) return 'Loading figures…';
  if (key === 'real-estate') {
    const row = units.realEstate;
    const available = row.available == null ? '' : ` · ${row.available} available · ${row.sold ?? 0} sold`;
    return `${row.leads} leads · ${row.projects} projects${available}`;
  }
  if (key === 'jewellery') {
    const row = units.jewellery;
    return `${row.leads} enquiries · ${row.products} products`;
  }
  return `${units.overall.leads} leads · ${units.realEstate.leads} real estate · ${units.jewellery.leads} jewellery`;
}

export function BusinessSwitcher({
  active,
  units,
}: {
  active: OverviewScope;
  units?: DashboardOverview['businessUnits'];
}) {
  const { setBusiness } = useBusiness();
  return (
    <section aria-label="Business overviews" className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const selected = active === card.key;
        return (
          <Link
            key={card.key}
            href={card.href}
            onClick={() => setBusiness(card.key)}
            aria-current={selected ? 'page' : undefined}
            className={clsx(
              'group flex min-h-[9.5rem] flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition',
              'hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              card.key === 'real-estate' && 'border-blue-200 hover:border-blue-400 focus-visible:ring-blue-600',
              card.key === 'jewellery' && 'border-amber-200 hover:border-amber-400 focus-visible:ring-amber-600',
              card.key === 'all' && 'border-slate-200 hover:border-slate-400 focus-visible:ring-slate-700',
              selected && card.key === 'real-estate' && 'ring-2 ring-blue-600 border-blue-600',
              selected && card.key === 'jewellery' && 'ring-2 ring-amber-600 border-amber-500',
              selected && card.key === 'all' && 'ring-2 ring-slate-800 border-slate-800',
            )}
          >
            <span className="flex items-center justify-between gap-3">
              <span
                className={clsx(
                  'text-sm font-semibold uppercase tracking-wide',
                  card.key === 'real-estate' && 'text-blue-800',
                  card.key === 'jewellery' && 'text-amber-800',
                  card.key === 'all' && 'text-slate-700',
                )}
              >
                {card.title}
              </span>
              <Icon
                aria-hidden
                className={clsx(
                  'h-6 w-6',
                  card.key === 'real-estate' && 'text-blue-700',
                  card.key === 'jewellery' && 'text-amber-700',
                  card.key === 'all' && 'text-slate-600',
                )}
              />
            </span>
            <span className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</span>
            <span className="mt-auto pt-4 text-sm font-semibold text-slate-900">{summary(card.key, units)}</span>
          </Link>
        );
      })}
    </section>
  );
}
