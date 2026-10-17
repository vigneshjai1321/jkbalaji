'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, Search } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { AdminBtnSecondary } from '@/components/admin/AdminForm';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { applyLeadSearch } from '@/lib/lead-search';

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
  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const qRef = useRef(q);
  qRef.current = q;

  useEffect(() => {
    const s = searchParams.get('site') ?? '';
    const scheme = searchParams.get('scheme') === '1';
    setSite(s);
    setSchemeOnly(scheme);
    if (searchParams.get('leadType') === 'JK_NAGAR') setLeadType('JK_NAGAR');
  }, [searchParams]);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [viewing, setViewing] = useState<Lead | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-leads', page, pageSize, site, status, q],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (site) params.set('site', site);
      if (status) params.set('status', status);
      if (q.trim()) params.set('q', q.trim());
      return adminFetch<{ data: Lead[]; total: number; page: number; pageSize: number; totalPages: number }>(
        `/leads?${params}`,
      );
    },
    enabled: authReady && !!token,
  });

  const patch = useMutation({
    mutationFn: ({ id, status: st }: { id: string; status: string }) =>
      adminFetch(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify({ status: st }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-leads'] }),
  });

  const filtered = useMemo(() => {
    let rows = data?.data ?? [];
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
    return rows;
  }, [data, site, status, leadType, schemeOnly]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = applyLeadSearch(qRef.current, qInput);
      if (!next.resetPage) return;
      setPage(1);
      setQ(next.query);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [qInput]);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewing(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewing]);

  const description = schemeOnly
    ? 'Gold scheme enquiries from the website.'
    : site === 'REAL_ESTATE'
      ? 'Real estate enquiries from jkbalaji.in.'
      : site === 'JEWELLERY'
        ? 'Jewellery enquiries from cheyyarbalaji.com.'
        : 'Website enquiries from jkbalaji.in and cheyyarbalaji.com.';

  return (
    <AdminPanel
      title="Leads"
      description={description}
      headerExtra={
        <label className="relative block w-full min-w-0 sm:w-56 md:w-64 lg:w-72">
          <span className="sr-only">Search leads</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search leads..."
            aria-label="Search leads"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </label>
      }
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
        </div>

        {isLoading ? <div className="p-8 animate-pulse text-sm text-slate-500">Loading leads…</div> : null}
        {isError ? <div className="p-4 text-sm text-red-600">Could not load leads. Check your session and API.</div> : null}
        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-8">No leads match your filters.</p>
        ) : null}

        {data && data.totalPages > 1 ? (
          <p className="text-xs text-slate-500 mb-3">
            Showing page {data.page} of {data.totalPages} ({data.total} leads)
            <button type="button" className="ml-3 underline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button type="button" className="ml-2 underline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </p>
        ) : null}
        {!isLoading && filtered.length > 0 ? (
          <AdminTable
            headers={['Actions', 'Customer Name', 'Phone', 'Email', 'Enquiry', 'Submitted', 'Status']}
            rows={filtered.map((l) => [
              <button
                key={`view-${l.id}`}
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                aria-label={`View message from ${l.name}`}
                onClick={() => setViewing(l)}
              >
                <Eye className="h-3.5 w-3.5" aria-hidden />
                View
              </button>,
              <span key={`n-${l.id}`} className="block max-w-[10rem] truncate font-medium" title={l.name}>
                {l.name}
              </span>,
              l.phone,
              l.email ? (
                <span key={`e-${l.id}`} className="block max-w-[12rem] truncate" title={l.email}>
                  {l.email}
                </span>
              ) : (
                '—'
              ),
              l.leadType ? l.leadType.replace(/_/g, ' ') : '—',
              new Date(l.createdAt).toLocaleString('en-IN'),
              <select
                key={l.id}
                className="min-w-[7rem] rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={l.status}
                onChange={(e) => patch.mutate({ id: l.id, status: e.target.value })}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>,
            ])}
          />
        ) : null}
        {viewing ? <LeadMessageDialog lead={viewing} onClose={() => setViewing(null)} /> : null}
      </div>
    </AdminPanel>
  );
}

function LeadMessageDialog({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const enquiry = lead.leadType ? lead.leadType.replace(/_/g, ' ') : '—';
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-message-title"
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white text-sm text-slate-900 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <h2 id="lead-message-title" className="text-base font-semibold">
            Submitted message
          </h2>
          <AdminBtnSecondary type="button" onClick={onClose}>
            Close
          </AdminBtnSecondary>
        </div>
        <div className="min-w-0 space-y-3 overflow-y-auto px-4 py-3">
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Detail label="Customer" value={lead.name} />
            <Detail label="Phone" value={lead.phone} />
            <Detail label="Email" value={lead.email || '—'} />
            <Detail label="Enquiry" value={enquiry} />
            <Detail label="Submitted" value={new Date(lead.createdAt).toLocaleString('en-IN')} />
            <Detail label="Status" value={lead.status} />
            <Detail label="Site" value={lead.site === 'JEWELLERY' ? 'Jewellery' : 'Real estate'} />
            {lead.project ? <Detail label="Project" value={lead.project.name} /> : null}
            {lead.sourcePage ? <Detail label="Page" value={lead.sourcePage} /> : null}
          </dl>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-900 [overflow-wrap:anywhere]">
              {lead.message?.trim() ? lead.message : 'This lead has no submitted message.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="break-words [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
