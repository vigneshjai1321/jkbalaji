'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { clsx } from 'clsx';
import { formatInr, formatSqft } from '@/lib/plot-currency';

export type PlotRow = {
  id: string;
  plotNumber: string;
  surveyNumber: string | null;
  status: string;
  facing: string | null;
  areaSqft: string | null;
  lengthFt: string | null;
  widthFt: string | null;
  description: string | null;
  archived: boolean;
  priceInr: string | null;
  pricePerSqftInr?: string | null;
  project: { id: string; name: string; slug: string } | null;
  customer: { id: string; name: string; phone?: string } | null;
  broker?: { id: string; name: string; phone?: string } | null;
};

type PlotSummary = {
  total: number;
  available: number;
  reserved: number;
  sold: number;
  blocked: number;
  totalAreaSqft: number;
  availableAreaSqft: number;
  soldAreaSqft: number;
  availableValueInr?: number;
  unpricedAvailable?: number;
};

type ImportReview = {
  id: string;
  suppliedPlotNumber: string;
  areaSqft: string;
  reason: string;
  sourceNote: string | null;
};

type ProjectOption = { id: string; name: string; slug: string; phase: string };

const PAGE_SIZE = 20;
const STATUSES = ['AVAILABLE', 'RESERVED', 'SOLD', 'BLOCKED'] as const;

function formatArea(value: string | null) {
  return formatSqft(value);
}

function priceCell(row: PlotRow) {
  if (row.pricePerSqftInr) return `${formatInr(row.pricePerSqftInr)}/sq ft`;
  if (row.priceInr) return formatInr(row.priceInr);
  return 'Price not configured';
}

function basePriceCell(row: PlotRow) {
  if (row.priceInr) return formatInr(row.priceInr);
  if (row.pricePerSqftInr && row.areaSqft) {
    const base = Math.round(Number(row.areaSqft) * Number(row.pricePerSqftInr) * 100) / 100;
    return formatInr(base);
  }
  return '—';
}

function dimensions(row: PlotRow) {
  if (row.lengthFt && row.widthFt) return `${Number(row.lengthFt)} × ${Number(row.widthFt)} ft`;
  return '—';
}

function statusBadge(status: string) {
  const tone =
    status === 'AVAILABLE'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'RESERVED'
        ? 'bg-amber-100 text-amber-900'
        : status === 'SOLD'
          ? 'bg-slate-200 text-slate-800'
          : 'bg-red-100 text-red-800';
  return <span className={clsx('rounded-md px-2 py-0.5 text-xs font-semibold', tone)}>{status}</span>;
}

function plotQueryString(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) q.set(key, value);
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function PlotWorkspace({
  fixedProjectId,
  fixedProjectName,
  comingSoon,
}: {
  fixedProjectId?: string;
  fixedProjectName?: string;
  comingSoon?: boolean;
}) {
  const qc = useQueryClient();
  const [projectFilter, setProjectFilter] = useState(fixedProjectId ?? '');
  const [statusFilter, setStatusFilter] = useState('');
  const [archivedFilter, setArchivedFilter] = useState<'active' | 'include' | 'only'>('active');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'plotNumber' | 'areaSqft' | 'priceInr' | 'pricePerSqftInr' | 'status'>('plotNumber');
  const [importSummary, setImportSummary] = useState<{
    created: number;
    skipped: number;
    duplicates: Array<{ plotNumber: string; keptAreaSqft: number; skippedAreaSqft: number; reason: string }>;
    conflicts: Array<{ plotNumber: string; importAreaSqft: number; existingAreaSqft: number | null; reason: string }>;
  } | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<PlotRow | null>(null);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const effectiveProjectId = fixedProjectId ?? (projectFilter || undefined);

  const projects = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => adminFetch<ProjectOption[]>('/projects'),
  });

  const listQuery = useMemo(
    () =>
      plotQueryString({
        projectId: effectiveProjectId,
        status: statusFilter || undefined,
        archived: archivedFilter === 'active' ? undefined : archivedFilter === 'only' ? 'only' : 'include',
        q: search.trim() || undefined,
      }),
    [effectiveProjectId, statusFilter, archivedFilter, search],
  );

  const { data: rows, isLoading } = useQuery({
    queryKey: ['erp-plots', listQuery],
    queryFn: () => adminFetch<PlotRow[]>(`/erp/plots${listQuery}`),
  });

  const summaryQuery = useMemo(
    () => plotQueryString({ projectId: effectiveProjectId }),
    [effectiveProjectId],
  );

  const { data: summary } = useQuery({
    queryKey: ['erp-plots-summary', summaryQuery],
    queryFn: () => adminFetch<PlotSummary>(`/erp/plots/summary${summaryQuery}`),
  });

  const projectSlug = (projects.data ?? []).find((p) => p.id === effectiveProjectId)?.slug;

  const importReviews = useQuery({
    queryKey: ['plot-import-reviews', effectiveProjectId],
    queryFn: () => adminFetch<ImportReview[]>(`/erp/plots/import/reviews?projectId=${effectiveProjectId}`),
    enabled: Boolean(effectiveProjectId),
  });

  const runJkImport = useMutation({
    mutationFn: () =>
      adminFetch<{
        summary: { created: number; skipped: number; duplicates: number; conflicts: number };
        duplicates: Array<{ plotNumber: string; keptAreaSqft: number; skippedAreaSqft: number; reason: string }>;
        conflicts: Array<{ plotNumber: string; importAreaSqft: number; existingAreaSqft: number | null; reason: string }>;
      }>('/erp/plots/import/jk-nagar-phase-1', { method: 'POST' }),
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['erp-plots'] });
      void qc.invalidateQueries({ queryKey: ['erp-plots-summary'] });
      setImportSummary({
        created: res.summary.created,
        skipped: res.summary.skipped,
        duplicates: res.duplicates ?? [],
        conflicts: res.conflicts ?? [],
      });
      setMessage({ type: 'ok', text: 'JK Nagar Phase 1 import finished.' });
    },
    onError: (err: Error) => setMessage({ type: 'err', text: err.message }),
  });

  const sorted = useMemo(() => {
    const list = [...(rows ?? [])];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'plotNumber') cmp = a.plotNumber.localeCompare(b.plotNumber, undefined, { numeric: true });
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status);
      else {
        const av = Number((a as PlotRow)[sortKey] ?? 0);
        const bv = Number((b as PlotRow)[sortKey] ?? 0);
        cmp = av - bv;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [rows, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const remove = useMutation({
    mutationFn: (id: string) => adminFetch<{ archived?: boolean }>(`/erp/plots/${id}`, { method: 'DELETE' }),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ['erp-plots'] });
      void qc.invalidateQueries({ queryKey: ['erp-plots-summary'] });
      setPendingDelete(null);
      setMessage({
        type: 'ok',
        text: result.archived ? 'Plot archived — history preserved.' : 'Plot removed.',
      });
    },
    onError: (err: Error) => setMessage({ type: 'err', text: err.message }),
  });

  const title = fixedProjectName ? `${fixedProjectName} · Plots` : 'Plots';
  const addHref = fixedProjectId ? `/plots/new?projectId=${fixedProjectId}` : '/plots/new';
  const quoteHref = fixedProjectId ? `/projects/${fixedProjectId}/quotation/new` : null;

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <AdminPanel
      title={title}
      actions={
        comingSoon ? (
          <span className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Coming soon</span>
        ) : (
          <span className="flex flex-wrap gap-2">
            {quoteHref ? (
              <Link href={quoteHref} className="rounded-xl border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                New quotation
              </Link>
            ) : null}
            <Link href={addHref} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
              Add plot
            </Link>
          </span>
        )
      }
    >
      {comingSoon ? (
        <p className="px-4 py-6 text-sm text-slate-600">
          JK Nagar Phase 3 is not open for plot inventory yet. You can still review enquiries linked to this project.
        </p>
      ) : null}

      {message ? (
        <p
          className={clsx(
            'mx-4 mt-4 rounded-lg px-3 py-2 text-sm',
            message.type === 'ok' ? 'bg-emerald-50 text-emerald-900' : 'bg-red-50 text-red-800',
          )}
        >
          {message.text}
        </p>
      ) : null}

      {projectSlug === 'jk-nagar-phase-1' && !comingSoon ? (
        <div className="border-b border-white/5 p-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={runJkImport.isPending}
            onClick={() => {
              setImportSummary(null);
              runJkImport.mutate();
            }}
          >
            {runJkImport.isPending ? 'Importing…' : 'Import JK Nagar Phase 1 plot list'}
          </button>
          <p className="text-xs opacity-70">Duplicate plot numbers in the list are skipped automatically (first row kept). Existing plots are never overwritten.</p>
          {importSummary ? (
            <div className="w-full rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-slate-800 space-y-2">
              <p className="font-semibold">Import summary</p>
              <ul className="grid sm:grid-cols-2 gap-1 text-xs">
                <li>Created: {importSummary.created}</li>
                <li>Skipped (already in database): {importSummary.skipped}</li>
                <li>Duplicate rows skipped: {importSummary.duplicates.length}</li>
                <li>Conflicts (preserved existing): {importSummary.conflicts.length}</li>
              </ul>
              {importSummary.duplicates.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-amber-900 mt-2">Duplicates (one notice per plot)</p>
                  <ul className="mt-1 space-y-1">
                    {importSummary.duplicates.map((d) => (
                      <li key={d.plotNumber} className="text-xs text-slate-700">
                        Plot <span className="font-mono font-semibold">{d.plotNumber}</span>: kept {formatSqft(d.keptAreaSqft)} sq ft, skipped{' '}
                        {formatSqft(d.skippedAreaSqft)} sq ft.
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {importSummary.conflicts.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-red-900 mt-2">Conflicts</p>
                  <ul className="mt-1 space-y-1">
                    {importSummary.conflicts.map((c) => (
                      <li key={c.plotNumber} className="text-xs text-slate-700">
                        Plot <span className="font-mono font-semibold">{c.plotNumber}</span>: {c.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {(importReviews.data?.length ?? 0) > 0 ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 p-4 text-sm">
          <h3 className="font-semibold text-amber-900">Older import review items</h3>
          <ul className="mt-2 space-y-2">
            {importReviews.data!.map((r) => (
              <li key={r.id} className="rounded-lg border border-amber-300/50 bg-white/80 p-2 text-slate-800">
                <span className="font-mono font-semibold">{r.suppliedPlotNumber}</span> — {formatSqft(r.areaSqft)} sq ft
                <p className="text-xs text-slate-600 mt-1">{r.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2 border-b border-white/5 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
        {[
          { label: 'Total', value: summary?.total ?? '—' },
          { label: 'Available', value: summary?.available ?? '—' },
          { label: 'Reserved', value: summary?.reserved ?? '—' },
          { label: 'Sold', value: summary?.sold ?? '—' },
          { label: 'Total area (sq ft)', value: summary ? summary.totalAreaSqft.toLocaleString('en-IN') : '—' },
          { label: 'Available area', value: summary ? summary.availableAreaSqft.toLocaleString('en-IN') : '—' },
          {
            label: 'Available value',
            value: summary?.availableValueInr != null ? formatInr(summary.availableValueInr) : '—',
          },
          {
            label: 'Unpriced available',
            value: summary?.unpricedAvailable != null ? summary.unpricedAvailable : '—',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-emerald-500/10 py-2 text-center text-xs">
            <p className="text-lg font-bold">{item.value}</p>
            <p className="opacity-70">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="text-sm flex-1 min-w-[10rem]">
          Search
          <input
            className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm"
            placeholder="Plot or survey number"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
        {!fixedProjectId ? (
          <label className="text-sm min-w-[10rem]">
            Project
            <select
              className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm"
              value={projectFilter}
              onChange={(e) => {
                setProjectFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">All projects</option>
              {(projects.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="text-sm min-w-[8rem]">
          Status
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm min-w-[8rem]">
          Records
          <select
            className="mt-1 w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm"
            value={archivedFilter}
            onChange={(e) => {
              setArchivedFilter(e.target.value as typeof archivedFilter);
              setPage(0);
            }}
          >
            <option value="active">Active only</option>
            <option value="include">Active + archived</option>
            <option value="only">Archived only</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="p-8 text-sm opacity-60">Loading plots…</div>
      ) : sorted.length === 0 ? (
        <div className="p-8 text-sm opacity-70">No plots match your filters. Add a plot to start inventory for this phase.</div>
      ) : (
        <>
          <AdminTable
            headers={[
              <button key="pn" type="button" className="font-semibold hover:underline" onClick={() => toggleSort('plotNumber')}>
                Plot #
              </button>,
              'Project',
              <button key="ar" type="button" className="font-semibold hover:underline" onClick={() => toggleSort('areaSqft')}>
                Area (sq ft)
              </button>,
              'Dimensions',
              <button key="pr" type="button" className="font-semibold hover:underline" onClick={() => toggleSort('pricePerSqftInr')}>
                ₹ / sq ft
              </button>,
              'Base price',
              <button key="st" type="button" className="font-semibold hover:underline" onClick={() => toggleSort('status')}>
                Status
              </button>,
              'Customer / broker',
              'Actions',
            ]}
            rows={pageRows.map((p) => [
              p.plotNumber,
              p.project?.name ?? '—',
              formatArea(p.areaSqft),
              dimensions(p),
              priceCell(p),
              basePriceCell(p),
              statusBadge(p.status),
              <span key={`${p.id}-cb`} className="text-xs">
                {p.customer?.name ?? '—'}
                {p.broker ? <span className="block text-slate-500">Broker: {p.broker.name}</span> : null}
              </span>,
              <span key={p.id} className="inline-flex flex-wrap gap-2 text-xs">
                <Link href={`/plots/${p.id}`} className="text-emerald-500 hover:underline">
                  View
                </Link>
                <Link href={`/plots/${p.id}/edit`} className="text-sky-400 hover:underline">
                  Edit
                </Link>
                {fixedProjectId && p.status === 'AVAILABLE' ? (
                  <Link href={`/projects/${fixedProjectId}/quotation/new?plotId=${p.id}`} className="text-blue-500 hover:underline">
                    Quote
                  </Link>
                ) : null}
                <button type="button" className="text-red-400 hover:underline" onClick={() => setPendingDelete(p)}>
                  Delete
                </button>
              </span>,
            ])}
          />
          <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
            <p className="opacity-70">
              {sorted.length} plot{sorted.length === 1 ? '' : 's'}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-1 disabled:opacity-40"
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span>
                Page {page + 1} / {pageCount}
              </span>
              <button
                type="button"
                className="rounded-lg border px-3 py-1 disabled:opacity-40"
                disabled={page + 1 >= pageCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-2xl bg-white p-5 text-sm text-slate-900 shadow-xl">
            <p className="font-semibold">Remove plot {pendingDelete.plotNumber}?</p>
            <p className="mt-2 text-slate-600">
              Project: {pendingDelete.project?.name ?? 'Unassigned'}. Sold or reserved plots are archived instead of deleted.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-50"
                disabled={remove.isPending}
                onClick={() => remove.mutate(pendingDelete.id)}
              >
                {remove.isPending ? 'Working…' : 'Confirm'}
              </button>
              <button type="button" className="rounded-lg border px-4 py-2" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPanel>
  );
}
