'use client';

import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Building2, Gem, Phone, Inbox, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { adminFetch, type DashboardOverview } from '../../lib/admin-api';
import { KpiCard } from './KpiCard';
import { useAdminAuth } from './AdminAuthContext';
import { BusinessSwitcher, type OverviewScope } from './BusinessSwitcher';

function LeadBadge({ status, dark }: { status: string; dark: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        dark ? 'bg-emerald-500/15 text-emerald-300' : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
      }`}
    >
      {status}
    </span>
  );
}

function EnquiryTable({
  title,
  leads,
  empty,
  dark,
  viewHref,
}: {
  title: string;
  leads: DashboardOverview['recentLeads'];
  empty: string;
  dark: boolean;
  viewHref: string;
}) {
  const card = dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white';
  return (
    <div className={`rounded-xl border p-4 md:p-5 ${card}`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <Link href={viewHref} className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      </div>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm min-w-[280px]">
          <thead>
            <tr className={`text-left text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
              <th className="pb-2 pr-3 font-semibold">Name</th>
              <th className="pb-2 pr-3 font-semibold">Phone</th>
              <th className="pb-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-sm text-slate-500">
                  {empty}
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className={`border-t ${dark ? 'border-white/5' : 'border-slate-100'}`}>
                  <td className="py-2.5 pr-3 font-medium max-w-[8rem] truncate" title={l.name}>
                    {l.name}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-400">{l.phone ?? '—'}</td>
                  <td className="py-2.5">
                    <LeadBadge status={l.status} dark={dark} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardView({
  theme,
  scope = 'all',
  showBusinessCards = true,
}: {
  theme: 'dark' | 'light';
  scope?: OverviewScope;
  showBusinessCards?: boolean;
}) {
  const dark = theme === 'dark';
  const { token, ready } = useAdminAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminFetch<DashboardOverview>('/dashboard'),
    enabled: ready && !!token,
  });

  const cards = showBusinessCards ? <BusinessSwitcher active={scope} units={data?.businessUnits} /> : null;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        {cards}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-24 rounded-xl animate-pulse ${dark ? 'bg-white/5' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        {cards}
        <div className={`rounded-xl border p-6 ${dark ? 'border-red-500/30 bg-red-950/20' : 'border-red-200 bg-red-50'}`}>
          <p className="text-sm">Could not load dashboard. {error instanceof Error ? error.message : ''}</p>
          <button type="button" onClick={() => refetch()} className="mt-3 text-sm text-blue-600 underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bu = data.businessUnits;
  const reLeads = bu?.realEstate.leads ?? 0;
  const reNew = bu?.realEstate.leadsNew ?? 0;
  const jewLeads = bu?.jewellery.leads ?? 0;
  const jewNew = data.recentLeads.filter((l) => l.site === 'JEWELLERY' && l.status === 'NEW').length;

  const recentAll = data.recentLeads.slice(0, 8);
  const recentRe = data.recentLeads.filter((l) => l.site === 'REAL_ESTATE').slice(0, 6);
  const recentJew = data.recentLeads.filter((l) => l.site === 'JEWELLERY').slice(0, 6);
  const leadChart = Object.entries(data.leadsByStatus).map(([status, count]) => ({ status, count }));

  const title =
    scope === 'real-estate' ? 'Real estate overview' : scope === 'jewellery' ? 'Gold & jewellery overview' : 'All businesses overview';
  const intro =
    scope === 'real-estate'
      ? 'Plots, brokers, and commissions at a glance.'
      : scope === 'jewellery'
        ? 'Shop rates, enquiries, and billing.'
        : 'Real estate and jewellery — separate KPIs below.';

  return (
    <div className="space-y-6 max-w-[1400px]">
      {cards}
      <header>
        <h1 className="text-2xl md:text-[1.65rem] font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className={`text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{intro}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium rounded-lg border px-2.5 py-1 border-slate-300 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/5"
          >
            Refresh
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {scope !== 'jewellery' ? (
          <KpiCard theme={theme} accent="emerald" icon={Building2} label="Real estate leads" value={String(reLeads)} hint={`${reNew} new · ${data.properties} properties`} />
        ) : null}
        {scope !== 'real-estate' ? (
          <KpiCard theme={theme} accent="amber" icon={Gem} label="Jewellery leads" value={String(jewLeads)} hint={`${jewNew} recent new · ${data.products} products · ${bu?.jewellery.stockSkus ?? 0} stock lines. Stock value is not stored.`} />
        ) : null}
        {scope === 'all' ? (
          <>
            <KpiCard theme={theme} accent="blue" icon={Inbox} label="Total leads" value={String(data.leads)} hint="All websites" />
            <KpiCard theme={theme} accent="emerald" icon={Phone} label="New enquiries" value={String(data.leadsNew)} hint="Status: NEW" />
          </>
        ) : null}
        {scope === 'real-estate' ? (
          <>
            <Link href="/projects" className="block h-full">
              <KpiCard theme={theme} accent="blue" icon={Inbox} label="Projects" value={String(bu?.realEstate.activeProjects ?? data.projects)} hint="Active pipeline" />
            </Link>
            <Link href="/plots" className="block h-full">
              <KpiCard theme={theme} accent="emerald" icon={MapPin} label="Plots" value={String(bu?.realEstate.plotTotal ?? 0)} hint={`${bu?.realEstate.plotAvailable ?? 0} available · ${bu?.realEstate.plotReserved ?? 0} reserved · ${bu?.realEstate.plotSold ?? 0} sold`} />
            </Link>
            <Link href="/brokers" className="block h-full">
              <KpiCard theme={theme} accent="blue" icon={Building2} label="Brokers" value={String(bu?.realEstate.activeBrokers ?? 0)} hint="Active" />
            </Link>
            <Link href="/leads?site=REAL_ESTATE" className="block h-full">
              <KpiCard theme={theme} accent="emerald" icon={Phone} label="New enquiries" value={String(reNew)} hint={`${reLeads} total`} />
            </Link>
            <Link href="/commissions" className="block h-full sm:col-span-2 xl:col-span-2">
              <KpiCard theme={theme} accent="amber" icon={Phone} label="Commission outstanding" value={`₹${(bu?.realEstate.commissionOutstanding ?? 0).toLocaleString('en-IN')}`} hint={`Liability ₹${(bu?.realEstate.commissionExpected ?? 0).toLocaleString('en-IN')} · paid ₹${(bu?.realEstate.commissionPaid ?? 0).toLocaleString('en-IN')}`} />
            </Link>
          </>
        ) : null}
        {scope === 'jewellery' ? (
          <>
            <KpiCard theme={theme} accent="amber" icon={Gem} label="22K / g" value={data.goldRate ? `₹${data.goldRate.rate22k.toLocaleString('en-IN')}` : '—'} hint={data.goldRate ? `Updated ${new Date(data.goldRate.effectiveDate).toLocaleDateString('en-IN')}` : 'Waiting for KJPL'} />
            <KpiCard theme={theme} accent="amber" icon={Gem} label="24K / g" value={data.goldRate ? `₹${data.goldRate.rate24k.toLocaleString('en-IN')}` : '—'} hint="From 22K × 24/22" />
            <KpiCard
              theme={theme}
              accent="amber"
              icon={Gem}
              label="1 Sovereign · 22K · 8 g"
              value={
                data.goldRate
                  ? `₹${(Math.round(data.goldRate.rate22k * 8 * 100) / 100).toLocaleString('en-IN')}`
                  : '—'
              }
              hint="22K × 8 g"
            />
            <Link href="/gold-rates" className="block h-full">
              <KpiCard theme={theme} accent="blue" icon={Inbox} label="Products" value={String(data.products)} hint={`${jewLeads} enquiries`} />
            </Link>
          </>
        ) : null}
      </section>

      {scope === 'real-estate' ? (
        <Link href="/projects" className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
          Open projects <ArrowRight size={16} />
        </Link>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {scope !== 'jewellery' ? (
        <EnquiryTable
          title="JK Balaji Real Estate — recent enquiries"
          leads={recentRe}
          empty="No real-estate enquiries yet. Submissions from jkbalaji.in will appear here."
          dark={dark}
          viewHref="/leads?site=REAL_ESTATE"
        />
        ) : null}
        {scope !== 'real-estate' ? (
        <EnquiryTable
          title="Sri Balaji Thangamaligai — recent enquiries"
          leads={recentJew}
          empty="No jewellery enquiries yet. Submissions from cheyyarbalaji.com will appear here."
          dark={dark}
          viewHref="/leads?site=JEWELLERY"
        />
        ) : null}
      </section>

      {scope === 'all' ? (
      <section className="grid gap-4 lg:grid-cols-3">
        <div className={`lg:col-span-2 rounded-xl border p-4 md:p-5 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'}`}>
          <h3 className="text-base font-semibold mb-4">Latest enquiries (both businesses)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className={`text-left text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <th className="pb-2 pr-3">Name</th>
                  <th className="pb-2 pr-3">Business</th>
                  <th className="pb-2 pr-3">Status</th>
                  <th className="pb-2">When</th>
                </tr>
              </thead>
              <tbody>
                {recentAll.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-slate-500">
                      No enquiries recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentAll.map((l) => (
                    <tr key={l.id} className={`border-t ${dark ? 'border-white/5' : 'border-slate-100'}`}>
                      <td className="py-2.5 pr-3 font-medium">{l.name}</td>
                      <td className="py-2.5 pr-3 text-xs">
                        {l.site === 'JEWELLERY' ? 'Jewellery' : 'Real estate'}
                      </td>
                      <td className="py-2.5 pr-3">
                        <LeadBadge status={l.status} dark={dark} />
                      </td>
                      <td className="py-2.5 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Link href="/leads" className="inline-flex mt-4 text-sm font-medium text-blue-600 hover:underline">
            Open all leads
          </Link>
        </div>

        <div className={`rounded-xl border p-4 md:p-5 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'}`}>
          <h3 className="text-base font-semibold mb-4">Leads by status</h3>
          <div className="h-56">
            {leadChart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="status" tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: dark ? '#94a3b8' : '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: dark ? '#0f172a' : '#fff', borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-slate-500 py-8">No lead status data yet.</p>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {data.pendingFollowups > 0 ? `${data.pendingFollowups} follow-up(s) due — open CRM to manage.` : 'No pending follow-ups.'}
          </p>
          <Link href="/crm" className="inline-flex mt-3 text-sm font-medium text-blue-600 hover:underline">
            Lead pipeline
          </Link>
        </div>
      </section>
      ) : null}

      {scope === 'all' && data.recentActivity.length > 0 ? (
        <section className={`rounded-xl border p-4 md:p-5 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white'}`}>
          <h3 className="text-base font-semibold mb-3">Recent activity</h3>
          <ul className="space-y-2 max-h-64 overflow-auto">
            {data.recentActivity.slice(0, 10).map((a) => (
              <li key={`${a.type}-${a.id}`} className={`rounded-lg px-3 py-2.5 text-sm ${dark ? 'bg-white/[0.04]' : 'bg-slate-50'}`}>
                <p className="font-medium">{a.title}</p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{a.subtitle}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
