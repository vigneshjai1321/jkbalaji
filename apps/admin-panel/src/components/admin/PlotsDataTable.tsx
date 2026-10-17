'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { AdminDataTable, type AdminDataTableColumn } from '@/components/admin/AdminDataTable';
import type { PlotRow } from '@/components/admin/PlotWorkspace';
import { formatInr, formatSqft } from '@/lib/plot-currency';
import {
  DEFAULT_PLOT_COLUMN_ORDER,
  PINNED_PLOT_COLUMNS,
  PLOT_COLUMN_LABELS,
  PLOT_TABLE_PREFS_KEY,
  type PlotColumnId,
} from '@/lib/plot-table-prefs';

type SortKey = 'plotNumber' | 'areaSqft' | 'priceInr' | 'pricePerSqftInr' | 'status';

type Props = {
  rows: PlotRow[];
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onToggleSort: (key: SortKey) => void;
  onDelete: (row: PlotRow) => void;
  onHold?: (row: PlotRow) => void;
  fixedProjectId?: string;
};

function statusBadge(status: string) {
  const tone =
    status === 'AVAILABLE'
      ? 'bg-emerald-100 text-emerald-800'
      : status === 'RESERVED'
        ? 'bg-amber-100 text-amber-900'
        : status === 'SOLD'
          ? 'bg-slate-200 text-slate-800'
          : 'bg-red-100 text-red-800';
  return <span className={clsx('rounded px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap', tone)}>{status}</span>;
}

function holdLabel(row: PlotRow) {
  if (row.status === 'RESERVED') {
    return (
      <span className="text-[11px]">
        <span className="font-medium text-amber-900">On hold</span>
        {row.customer?.name ? <span className="block text-slate-600 truncate max-w-[10rem]" title={row.customer.name}>{row.customer.name}</span> : null}
      </span>
    );
  }
  if (row.status === 'BLOCKED') return <span className="text-[11px] text-red-800">Blocked</span>;
  if (row.status === 'SOLD') return <span className="text-[11px] text-slate-600">Sold</span>;
  return <span className="text-[11px] text-slate-500">—</span>;
}

function Trunc({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span className="block max-w-[12rem] truncate" title={title}>
      {children}
    </span>
  );
}

const SORT_BY_COLUMN: Partial<Record<PlotColumnId, SortKey>> = {
  plotNumber: 'plotNumber',
  areaSqft: 'areaSqft',
  pricePerSqft: 'pricePerSqftInr',
  basePrice: 'priceInr',
  status: 'status',
};

const COLUMN_BY_SORT: Record<SortKey, PlotColumnId> = {
  plotNumber: 'plotNumber',
  areaSqft: 'areaSqft',
  pricePerSqftInr: 'pricePerSqft',
  priceInr: 'basePrice',
  status: 'status',
};

export function PlotsDataTable({ rows, sortKey, sortDir, onToggleSort, onDelete, onHold, fixedProjectId }: Props) {
  const cellFor = (col: PlotColumnId, row: PlotRow) => {
    switch (col) {
      case 'actions':
        return (
          <span className="inline-flex items-center gap-0.5">
            <Link href={`/plots/${row.id}`} className="p-1 rounded hover:bg-slate-200/80 dark:hover:bg-white/10" title="View plot" aria-label={`View plot ${row.plotNumber}`}>
              <Eye className="h-4 w-4 text-emerald-600" />
            </Link>
            <Link href={`/plots/${row.id}/edit`} className="p-1 rounded hover:bg-slate-200/80 dark:hover:bg-white/10" title="Edit plot" aria-label={`Edit plot ${row.plotNumber}`}>
              <Pencil className="h-4 w-4 text-sky-600" />
            </Link>
            {onHold && row.status === 'AVAILABLE' && !row.archived ? (
              <button type="button" className="p-1 rounded hover:bg-slate-200/80 dark:hover:bg-white/10 text-amber-700 text-[10px] font-semibold px-1.5" title="Hold plot" onClick={() => onHold(row)}>
                Hold
              </button>
            ) : null}
            {fixedProjectId && row.status === 'AVAILABLE' ? (
              <Link
                href={`/projects/${fixedProjectId}/quotation/new?plotId=${row.id}`}
                className="p-1 text-[10px] font-semibold text-blue-600 hover:underline"
                title="New quotation"
              >
                Quote
              </Link>
            ) : null}
            <button
              type="button"
              className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
              title="Delete plot"
              aria-label={`Delete plot ${row.plotNumber}`}
              onClick={() => onDelete(row)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </span>
        );
      case 'plotNumber':
        return <span className="font-mono font-semibold text-xs">{row.plotNumber}</span>;
      case 'areaSqft':
        return <span className="tabular-nums text-xs">{formatSqft(row.areaSqft)}</span>;
      case 'project':
        return <Trunc title={row.project?.name}>{row.project?.name ?? '—'}</Trunc>;
      case 'status':
        return statusBadge(row.status);
      case 'broker':
        return row.broker ? <Trunc title={row.broker.name}>{row.broker.name}</Trunc> : '—';
      case 'pricePerSqft':
        return row.pricePerSqftInr ? <span className="tabular-nums text-xs whitespace-nowrap">{formatInr(row.pricePerSqftInr)}/sq ft</span> : '—';
      case 'basePrice':
        if (row.priceInr) return <span className="tabular-nums text-xs">{formatInr(row.priceInr)}</span>;
        if (row.pricePerSqftInr && row.areaSqft) {
          const base = Math.round(Number(row.areaSqft) * Number(row.pricePerSqftInr) * 100) / 100;
          return <span className="tabular-nums text-xs">{formatInr(base)}</span>;
        }
        return '—';
      case 'hold':
        return holdLabel(row);
      case 'surveyNumber':
        return row.surveyNumber ? <Trunc title={row.surveyNumber}>{row.surveyNumber}</Trunc> : '—';
      case 'facing':
        return row.facing ? <Trunc title={row.facing}>{row.facing}</Trunc> : '—';
      case 'dimensions':
        return row.lengthFt && row.widthFt ? `${Number(row.lengthFt)}×${Number(row.widthFt)}` : '—';
      case 'customer':
        return row.customer?.name ? <Trunc title={row.customer.name}>{row.customer.name}</Trunc> : '—';
      case 'description':
        return row.description ? <Trunc title={row.description}>{row.description}</Trunc> : '—';
      default:
        return '—';
    }
  };

  const columns = useMemo<AdminDataTableColumn<PlotRow>[]>(
    () =>
      DEFAULT_PLOT_COLUMN_ORDER.map((id) => ({
        id,
        header: PLOT_COLUMN_LABELS[id],
        cell: (row: PlotRow) => cellFor(id, row),
        sortable: Boolean(SORT_BY_COLUMN[id]),
        truncate: id !== 'actions',
        defaultWidth: id === 'actions' ? 168 : id === 'description' ? 220 : 132,
        minWidth: id === 'actions' ? 148 : 88,
      })),
    // cellFor closes over the latest row actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onDelete, onHold, fixedProjectId],
  );

  return (
    <AdminDataTable
      columns={columns}
      rows={rows}
      rowKey={(row) => row.id}
      sort={`${COLUMN_BY_SORT[sortKey]}:${sortDir}`}
      onSortChange={(next) => {
        const id = next.split(':')[0] as PlotColumnId;
        const key = SORT_BY_COLUMN[id];
        if (key) onToggleSort(key);
      }}
      emptyMessage="No plots match this view."
      maxHeightClass="max-h-[min(70vh,720px)]"
      columnLayout={{
        storageKey: PLOT_TABLE_PREFS_KEY,
        pinnedOrder: [...PINNED_PLOT_COLUMNS],
        requiredVisible: ['actions', 'plotNumber'],
        defaultHidden: ['surveyNumber', 'facing', 'dimensions', 'description'],
      }}
    />
  );
}
