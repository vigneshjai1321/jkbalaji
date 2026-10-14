'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';

type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  site: string;
  leadType: string | null;
  message: string | null;
  sourcePage: string | null;
  createdAt: string;
  project?: { id: string; name: string; slug: string } | null;
};

const statuses = ['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATION', 'QUALIFIED', 'WON', 'LOST'];

export default function LeadsPage() {
  const { token, ready: authReady } = useAdminAuth();
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [site, setSite] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [leadType, setLeadType] = useState<string>('');
  const [schemeOnly, setSchemeOnly] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    const s = searchParams.get('site') ?? '';
    const scheme = searchParams.get('scheme') === '1';
    setSite(s);
    setSchemeOnly(scheme);
    if (searchParams.get('leadType') === 'JK_NAGAR') setLeadType('JK_NAGAR');
  }, [searchParams]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => adminFetch<Lead[]>('/leads'),
    enabled: authReady && !!token,
  });

  const patch = useMutation({
    mutationFn: ({ id, status: st }: { id: string; status: string }) =>
      adminFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status: st }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-leads'] }),
  });

  const filtered = useMemo(() => {
    let rows = data ?? [];
    if (site) rows = rows.filter((l) => l.site === site);
    if (status) rows = rows.filter((l) => l.status === status);
    if (schemeOnly) {
      rows = rows.filter(
        (l) =>
          (l.leadType?.toUpperCase().includes('SCHEME') ?? false) ||
          (l.leadType?.toUpperCase().includes('GOLD') ?? false) ||
          (l.message?.toLowerCase().includes('scheme') ?? false),
      );
    } else if (leadType === 'JK_NAGAR') {
      rows = rows.filter((l) => l.leadType?.startsWith('JK_NAGAR'));
    } else if (leadType) {
      rows = rows.filter((l) => l.leadType === leadType);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      rows = rows.filter(
        (l) =>
          l.id.toLowerCase().includes(term) ||
          l.name.toLowerCase().includes(term) ||
          l.phone.includes(term) ||
          (l.email?.toLowerCase().includes(term) ?? false) ||
          (l.sourcePage?.toLowerCase().includes(term) ?? false),
      );
    }
    return rows;
  }, [data, site, status, leadType, schemeOnly, q]);

  const pageTitle = schemeOnly
    ? 'Gold scheme enquiries'
    : site === 'REAL_ESTATE'
      ? 'Real estate leads'
      : site === 'JEWELLERY'
        ? 'Jewellery leads'
        : 'All leads';

  return (
    <AdminPanel
      title={pageTitle}
      description="Enquiries from jkbalaji.in and cheyyarbalaji.com — stored in PostgreSQL."
    >
      <div className="p-4 md:p-6 border-b border-slate-100">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-slate-600">Business</span>
            <select className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm min-w-[10rem]" value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">All</option>
              <option value="REAL_ESTATE">Real estate</option>
              <option value="JEWELLERY">Jewellery</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-slate-600">Status</span>
            <select className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm min-w-[10rem]" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-slate-600">Lead type</span>
            <select className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm min-w-[10rem]" value={leadType} onChange={(e) => setLeadType(e.target.value)}>
              <option value="">All</option>
              <option value="JK_NAGAR">JK Nagar (any phase)</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm flex-1 min-w-[200px]">
            <span className="font-medium text-slate-600">Search</span>
            <input
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm w-full"
              placeholder="Name, phone, email, or page"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>

        {isLoading ? <div className="p-8 animate-pulse text-sm text-slate-500">Loading leads…</div> : null}
        {isError ? <div className="p-4 text-sm text-red-600">Could not load leads. Check your session and API.</div> : null}
        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-8">No leads match your filters.</p>
        ) : null}

        {!isLoading && filtered.length > 0 ? (
          <AdminTable
            headers={['Name', 'Phone', 'Site', 'Project', 'Type', 'Source', 'Status', 'Submitted']}
            rows={filtered.map((l) => [
              <span key={`n-${l.id}`} className="font-medium max-w-[10rem] truncate block" title={l.name}>
                {l.name}
              </span>,
              l.phone,
              l.site === 'JEWELLERY' ? 'Jewellery' : 'Real estate',
              l.project ? (
                <Link key={`p-${l.id}`} href={`/projects/${l.project.id}`} className="text-blue-700 hover:underline">
                  {l.project.name}
                </Link>
              ) : (
                '—'
              ),
              l.leadType ?? '—',
              l.sourcePage ? (
                <span className="max-w-[8rem] truncate block text-xs text-slate-600" title={l.sourcePage}>
                  {l.sourcePage}
                </span>
              ) : (
                '—'
              ),
              <select
                key={l.id}
                className="rounded-lg border border-slate-200 text-sm px-2 py-1.5 min-w-[7rem]"
                value={l.status}
                onChange={(e) => patch.mutate({ id: l.id, status: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>,
              new Date(l.createdAt).toLocaleString('en-IN'),
            ])}
          />
        ) : null}
      </div>
    </AdminPanel>
  );
}
