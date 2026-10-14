'use client';

import Link from 'next/link';
import { Building2, Gem, LayoutGrid, ArrowRight, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import type { DashboardOverview } from '../../lib/admin-api';

export type BusinessUnitKey = 'overall' | 'realEstate' | 'jewellery';

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function BusinessUnitCards({
  data,
  theme,
  selected,
  onSelect,
}: {
  data: NonNullable<DashboardOverview['businessUnits']>;
  theme: 'dark' | 'light';
  selected: BusinessUnitKey;
  onSelect: (key: BusinessUnitKey) => void;
}) {
  const dark = theme === 'dark';

  const base = dark
    ? 'border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02]'
    : 'border-slate-200 bg-white shadow-sm';
  const active = dark ? 'ring-2 ring-emerald-500/60 border-emerald-500/40' : 'ring-2 ring-emerald-500/40 border-emerald-400';

  const cards: {
    key: BusinessUnitKey;
    label: string;
    title: string;
    icon: typeof LayoutGrid;
    accent: string;
    href: string;
    stats: { dt: string; dd: string }[];
  }[] = [
    {
      key: 'overall',
      label: 'Overall business',
      title: 'Group summary',
      icon: LayoutGrid,
      accent: 'text-emerald-400',
      href: '/crm',
      stats: [
        { dt: 'Revenue (month)', dd: inr(data.overall.revenueMonth) },
        { dt: 'Total revenue', dd: inr(data.overall.revenueTotal) },
        { dt: 'Leads', dd: String(data.overall.leads) },
        { dt: 'Customers', dd: String(data.overall.customers) },
      ],
    },
    {
      key: 'realEstate',
      label: 'Real estate',
      title: 'jkbalaji.in',
      icon: Building2,
      accent: 'text-teal-400',
      href: '/realestate',
      stats: [
        { dt: 'Properties', dd: String(data.realEstate.properties) },
        { dt: 'Projects', dd: String(data.realEstate.projects) },
        { dt: 'Leads', dd: String(data.realEstate.leads) },
        { dt: 'New leads', dd: String(data.realEstate.leadsNew) },
      ],
    },
    {
      key: 'jewellery',
      label: 'Jewellery',
      title: 'cheyyarbalaji.com',
      icon: Gem,
      accent: 'text-amber-400',
      href: '/jewellery',
      stats: [
        { dt: 'Products', dd: String(data.jewellery.products) },
        { dt: 'Schemes', dd: String(data.jewellery.schemes) },
        { dt: 'Leads', dd: String(data.jewellery.leads) },
        {
          dt: '22K rate',
          dd: data.jewellery.goldRate22k ? `₹${data.jewellery.goldRate22k.toLocaleString('en-IN')}` : '—',
        },
      ],
    },
  ];

  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = selected === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelect(c.key)}
            className={clsx(
              'rounded-2xl border p-6 text-left transition-all hover:scale-[1.01] hover:shadow-lg',
              base,
              isActive ? active : 'hover:border-emerald-500/30',
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={clsx('text-xs font-semibold uppercase tracking-widest', c.accent.replace('text-', 'text-'))}>
                  {c.label}
                </p>
                <h2 className="mt-2 text-2xl font-bold">{c.title}</h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Icon className={c.accent} size={28} />
                {isActive ? <CheckCircle2 className="text-emerald-500" size={18} aria-label="Selected" /> : null}
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {c.stats.map((s) => (
                <div key={s.dt}>
                  <dt className={dark ? 'text-slate-400' : 'text-slate-500'}>{s.dt}</dt>
                  <dd className="font-bold text-lg">{s.dd}</dd>
                </div>
              ))}
            </dl>
            <Link
              href={c.href}
              onClick={(e) => e.stopPropagation()}
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-500"
            >
              Open module <ArrowRight size={14} />
            </Link>
          </button>
        );
      })}
    </section>
  );
}
