'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { useAdminTheme } from './AdminShell';

const LABELS: Record<string, string> = {
  realestate: 'Properties',
  jewellery: 'Jewellery',
  billing: 'Gold billing',
  'gold-rates': 'Gold rates',
  accounting: 'Accounting',
  expenses: 'Expenses',
  inventory: 'Inventory',
  customers: 'Customers',
  crm: 'CRM',
  leads: 'Leads',
  tasks: 'Tasks',
  reports: 'Reports',
  users: 'Users',
  audit: 'Audit logs',
  cms: 'Website CMS',
  settings: 'Settings',
  profile: 'Profile & security',
  analytics: 'Analytics',
  projects: 'Projects',
  overview: 'Overview',
  'real-estate': 'Real estate',
  plots: 'Plots',
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const dark = useAdminTheme() === 'dark';
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0 || parts[0] === 'billing') return null;

  const crumbs: { href: string; label: string }[] = [{ href: '/', label: 'Home' }];
  let acc = '';
  for (const seg of parts) {
    if (seg === 'new' || seg === 'edit') continue;
    acc += `/${seg}`;
    const label = LABELS[seg] ?? (seg.length > 20 ? 'Detail' : seg.replace(/-/g, ' '));
    crumbs.push({ href: acc, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className={clsx('mb-4 flex flex-wrap items-center gap-1 text-sm', dark ? 'text-slate-400' : 'text-slate-500')}>
      {crumbs.map((c, i) => (
        <span key={c.href} className="inline-flex items-center gap-1">
          {i > 0 ? <ChevronRight className="h-3 w-3 opacity-50" aria-hidden /> : null}
          {i === crumbs.length - 1 ? (
            <span className={dark ? 'text-slate-200' : 'text-slate-700'}>{c.label}</span>
          ) : (
            <Link href={c.href} scroll={false} className="hover:underline inline-flex items-center gap-1">
              {i === 0 ? <Home className="h-3 w-3" aria-hidden /> : null}
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
