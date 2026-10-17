'use client';

import { clsx } from 'clsx';
import { ChevronDown, ChevronUp, ChevronsUpDown, Columns3, GripVertical, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAdminTheme } from './AdminShell';
import {
  defaultColumnLayout,
  loadColumnLayout,
  moveColumn,
  resetColumnLayout,
  saveColumnLayout,
  storageKeyForTable,
  type ColumnLayout,
  type ColumnLayoutDefaults,
} from '@/lib/table-prefs';

export type AdminDataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Keep buttons and badges from being clipped. */
  truncate?: boolean;
};

export type AdminDataTablePagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

export type AdminColumnLayoutOptions = {
  tableId?: string;
  storageKey?: string;
  pinnedOrder?: string[];
  requiredVisible?: string[];
  defaultHidden?: string[];
};

type Props<T> = {
  columns: AdminDataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  pagination?: AdminDataTablePagination;
  sort?: string;
  onSortChange?: (sort: string) => void;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  maxHeightClass?: string;
  toolbar?: ReactNode;
  columnLayout?: AdminColumnLayoutOptions;
};

export function AdminDataTable<T>({
  columns,
  rows,
  rowKey,
  pagination,
  sort,
  onSortChange,
  isLoading,
  error,
  emptyMessage = 'No records found.',
  maxHeightClass,
  toolbar,
  columnLayout,
}: Props<T>) {
  const theme = useAdminTheme();
  const dark = theme === 'dark';
  const layoutKey = columnLayout?.storageKey ?? (columnLayout?.tableId ? storageKeyForTable(columnLayout.tableId) : null);
  const columnSignature = columns.map((col) => `${col.id}:${col.defaultWidth ?? ''}`).join('|');
  const pinnedSignature = columnLayout?.pinnedOrder?.join('|') ?? '';
  const requiredSignature = columnLayout?.requiredVisible?.join('|') ?? '';
  const hiddenSignature = columnLayout?.defaultHidden?.join('|') ?? '';
  const defaults = useMemo<ColumnLayoutDefaults>(
    () => ({
      order: columns.map((col) => col.id),
      visible: Object.fromEntries(columns.map((col) => [col.id, !columnLayout?.defaultHidden?.includes(col.id)])),
      widths: Object.fromEntries(columns.map((col) => [col.id, col.defaultWidth ?? 148])),
      pinnedOrder: columnLayout?.pinnedOrder,
      requiredVisible: columnLayout?.requiredVisible,
      minWidth: 72,
      maxWidth: 420,
    }),
    // Column identity is tracked by the signatures so cell renderers can change without resetting layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnSignature, pinnedSignature, requiredSignature, hiddenSignature],
  );
  const [layout, setLayout] = useState<ColumnLayout>(() => defaultColumnLayout(defaults));
  const [chooserOpen, setChooserOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const chooserRef = useRef<HTMLDivElement>(null);
  const dragId = useRef<string | null>(null);

  useEffect(() => {
    setLayout(layoutKey ? loadColumnLayout(layoutKey, defaults) : defaultColumnLayout(defaults));
  }, [layoutKey, defaults]);

  useEffect(() => {
    if (!chooserOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (chooserRef.current && !chooserRef.current.contains(event.target as Node)) setChooserOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setChooserOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [chooserOpen]);

  const persist = useCallback(
    (next: ColumnLayout) => {
      const saved = layoutKey ? saveColumnLayout(layoutKey, next, defaults) : defaultColumnLayout({ ...defaults, ...next, order: next.order });
      setLayout(layoutKey ? saved : next);
    },
    [defaults, layoutKey],
  );

  const visibleColumns = useMemo(() => {
    const byId = new Map(columns.map((col) => [col.id, col]));
    return layout.order.map((id) => byId.get(id)).filter((col): col is AdminDataTableColumn<T> => Boolean(col && layout.visible[col.id]));
  }, [columns, layout]);

  const shownCount = visibleColumns.length;
  const chooserColumns = layout.order
    .map((id) => columns.find((col) => col.id === id))
    .filter((col): col is AdminDataTableColumn<T> => Boolean(col))
    .filter((col) => !query.trim() || col.header.toLowerCase().includes(query.trim().toLowerCase()));

  const sortIcon = (colId: string) => {
    if (!sort?.startsWith(`${colId}:`)) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden />;
    return sort.endsWith(':asc') ? <ChevronUp className="h-3.5 w-3.5" aria-hidden /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden />;
  };

  const toggleSort = (col: AdminDataTableColumn<T>) => {
    if (!col.sortable || !onSortChange) return;
    const next = sort === `${col.id}:asc` ? `${col.id}:desc` : `${col.id}:asc`;
    onSortChange(next);
  };

  const reorder = (fromId: string, toId: string) => {
    persist({ ...layout, order: moveColumn(layout.order, fromId, toId, defaults.pinnedOrder) });
  };

  const startResize = (id: string, event: { clientX: number; preventDefault: () => void; stopPropagation: () => void }) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = layout.widths[id] ?? 148;
    const min = columns.find((col) => col.id === id)?.minWidth ?? 72;
    const max = columns.find((col) => col.id === id)?.maxWidth ?? 420;
    const move = (ev: PointerEvent) => {
      const width = Math.min(max, Math.max(min, Math.round(startWidth + ev.clientX - startX)));
      setLayout((current) => ({ ...current, widths: { ...current.widths, [id]: width } }));
    };
    const up = (ev: PointerEvent) => {
      const width = Math.min(max, Math.max(min, Math.round(startWidth + ev.clientX - startX)));
      setLayout((current) => {
        const next = { ...current, widths: { ...current.widths, [id]: width } };
        if (layoutKey) saveColumnLayout(layoutKey, next, defaults);
        return next;
      });
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const from = pagination ? (pagination.page - 1) * pagination.pageSize + (pagination.total ? 1 : 0) : 0;
  const to = pagination ? Math.min(pagination.page * pagination.pageSize, pagination.total) : rows.length;
  const customizable = Boolean(layoutKey);

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">{toolbar}</div>
        {customizable ? (
          <div className="relative shrink-0 self-end sm:self-auto" ref={chooserRef}>
            <button
              type="button"
              className={clsx(
                'inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
                dark ? 'border-white/15 hover:bg-white/5' : 'border-slate-200 bg-white hover:bg-slate-50',
              )}
              title="Customize columns"
              aria-expanded={chooserOpen}
              onClick={() => setChooserOpen((open) => !open)}
            >
              <Columns3 className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Columns</span>
            </button>
            {chooserOpen ? (
              <div
                className={clsx(
                  'absolute right-0 z-30 mt-1 w-[min(18rem,calc(100vw-2rem))] rounded-lg border p-2 text-xs shadow-lg',
                  dark ? 'border-white/10 bg-slate-900 text-slate-100' : 'border-slate-200 bg-white text-slate-900',
                )}
              >
                <div className="flex items-center justify-between px-1 pb-1">
                  <p className="font-semibold">Customize columns</p>
                  <p className="text-slate-500">
                    {shownCount} of {columns.length} columns
                  </p>
                </div>
                {columns.length >= 8 ? (
                  <input
                    className="mb-2 w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                    placeholder="Find a column"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Find a column"
                  />
                ) : null}
                <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                  {chooserColumns.map((col) => {
                    const required = defaults.requiredVisible?.includes(col.id);
                    return (
                      <li key={col.id}>
                        <label className="flex items-center gap-2 rounded px-1 py-1 hover:bg-slate-50 dark:hover:bg-white/5">
                          <input
                            type="checkbox"
                            checked={layout.visible[col.id] !== false}
                            disabled={required}
                            onChange={() => {
                              if (required) return;
                              persist({ ...layout, visible: { ...layout.visible, [col.id]: !layout.visible[col.id] } });
                            }}
                          />
                          <span className="min-w-0 flex-1 truncate">{col.header}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2 flex gap-3 border-t border-slate-100 px-1 pt-2">
                  <button
                    type="button"
                    className="font-semibold text-emerald-700 hover:underline"
                    onClick={() =>
                      persist({
                        ...layout,
                        visible: Object.fromEntries(columns.map((col) => [col.id, true])),
                      })
                    }
                  >
                    Show all
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-slate-600 hover:underline"
                    onClick={() => setLayout(layoutKey ? resetColumnLayout(layoutKey, defaults) : defaultColumnLayout(defaults))}
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden />
                    Reset
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={clsx('min-w-0 overflow-hidden rounded-xl border', dark ? 'border-white/10' : 'border-slate-200', maxHeightClass && 'flex flex-col')}>
        <div className={clsx('overflow-x-auto', maxHeightClass && `${maxHeightClass} overflow-y-auto`)}>
          <table className="w-full table-fixed border-collapse text-sm" style={{ minWidth: visibleColumns.reduce((sum, col) => sum + (layout.widths[col.id] ?? 148), 0) }}>
            <thead className={clsx('sticky top-0 z-10', dark ? 'bg-slate-900/95 text-slate-400' : 'bg-slate-50 text-slate-600')}>
              <tr>
                {visibleColumns.map((col) => {
                  const pinned = defaults.pinnedOrder?.includes(col.id);
                  return (
                    <th
                      key={col.id}
                      scope="col"
                      style={{ width: layout.widths[col.id] ?? col.defaultWidth ?? 148 }}
                      className={clsx(
                        'relative whitespace-nowrap border-b px-3 py-2.5 text-left font-medium',
                        dark ? 'border-white/10' : 'border-slate-200',
                        dragOver === col.id && !pinned && 'bg-emerald-50',
                        col.className,
                      )}
                      onDragOver={(event) => {
                        if (!customizable || pinned || !dragId.current) return;
                        event.preventDefault();
                        setDragOver(col.id);
                      }}
                      onDrop={() => {
                        if (dragId.current && dragId.current !== col.id) reorder(dragId.current, col.id);
                        dragId.current = null;
                        setDragOver(null);
                      }}
                    >
                      <span className="inline-flex max-w-full items-center gap-1">
                        {customizable && !pinned ? (
                          <button
                            type="button"
                            draggable
                            className="cursor-grab rounded p-0.5 text-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                            aria-label={`Move ${col.header} column. Alt and arrow keys also move it.`}
                            title="Drag to reorder"
                            onDragStart={() => {
                              dragId.current = col.id;
                            }}
                            onDragEnd={() => {
                              dragId.current = null;
                              setDragOver(null);
                            }}
                            onKeyDown={(event) => {
                              if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
                              event.preventDefault();
                              const visibleIds = visibleColumns.map((item) => item.id);
                              const index = visibleIds.indexOf(col.id);
                              const target = visibleIds[index + (event.key === 'ArrowLeft' ? -1 : 1)];
                              if (target) reorder(col.id, target);
                            }}
                          >
                            <GripVertical className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        ) : null}
                        {col.sortable && onSortChange ? (
                          <button type="button" className="inline-flex min-w-0 items-center gap-1 hover:text-slate-900" onClick={() => toggleSort(col)}>
                            <span className="truncate">{col.header}</span>
                            {sortIcon(col.id)}
                          </button>
                        ) : (
                          <span className="truncate">{col.header}</span>
                        )}
                      </span>
                      {customizable ? (
                        <button
                          type="button"
                          aria-label={`Resize ${col.header}`}
                          className="absolute inset-y-0 right-0 w-1.5 cursor-col-resize hover:bg-emerald-400/70"
                          onPointerDown={(event) => startResize(col.id, event)}
                        />
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={Math.max(visibleColumns.length, 1)} className="px-4 py-10 text-center text-slate-500">
                    Loading…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={Math.max(visibleColumns.length, 1)} className="px-4 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(visibleColumns.length, 1)} className="px-4 py-10 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={rowKey(row)} className={clsx('border-t', dark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-slate-100 hover:bg-slate-50/80')}>
                    {visibleColumns.map((col) => (
                      <td key={col.id} style={{ width: layout.widths[col.id] }} className={clsx('px-3 py-2.5 align-top', col.truncate !== false && 'max-w-0', col.className)}>
                        <div className={col.truncate === false ? undefined : 'truncate'}>{col.cell(row)}</div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination ? (
          <div className={clsx('flex flex-col gap-3 border-t px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between', dark ? 'border-white/10 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/80')}>
            <p className="text-slate-500" aria-live="polite">
              {pagination.total ? `Showing ${from}–${to} of ${pagination.total}` : 'Showing 0 results'}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <span className="text-slate-500">Rows per page</span>
                <select className="rounded-lg border bg-white px-2 py-1.5 text-sm" value={pagination.pageSize} aria-label="Rows per page" onChange={(event) => pagination.onPageSizeChange(Number(event.target.value))}>
                  {(pagination.pageSizeOptions ?? [10, 25, 50, 100]).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-1">
                <button type="button" className="rounded-lg border px-2.5 py-1.5 disabled:opacity-40" disabled={pagination.page <= 1 || isLoading} aria-label="Previous page" onClick={() => pagination.onPageChange(pagination.page - 1)}>
                  Previous
                </button>
                <button type="button" className="rounded-lg border px-2.5 py-1.5 disabled:opacity-40" disabled={pagination.page >= pagination.totalPages || isLoading} aria-label="Next page" onClick={() => pagination.onPageChange(pagination.page + 1)}>
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
