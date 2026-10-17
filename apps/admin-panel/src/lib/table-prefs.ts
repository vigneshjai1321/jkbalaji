export type ColumnLayout = {
  order: string[];
  visible: Record<string, boolean>;
  widths: Record<string, number>;
};

export type ColumnLayoutDefaults = {
  order: string[];
  visible: Record<string, boolean>;
  widths?: Record<string, number>;
  /** Stay at the front, in this order. They can still be hidden unless listed in requiredVisible. */
  pinnedOrder?: string[];
  /** Cannot be hidden. */
  requiredVisible?: string[];
  minWidth?: number;
  maxWidth?: number;
};

const DEFAULT_MIN = 72;
const DEFAULT_MAX = 420;
const DEFAULT_WIDTH = 148;

function clampWidth(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return DEFAULT_WIDTH;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function defaultColumnLayout(defaults: ColumnLayoutDefaults): ColumnLayout {
  const min = defaults.minWidth ?? DEFAULT_MIN;
  const max = defaults.maxWidth ?? DEFAULT_MAX;
  const widths: Record<string, number> = {};
  const visible: Record<string, boolean> = {};
  for (const id of defaults.order) {
    widths[id] = clampWidth(defaults.widths?.[id] ?? DEFAULT_WIDTH, min, max);
    visible[id] = defaults.requiredVisible?.includes(id) ? true : defaults.visible[id] !== false;
  }
  return normalizeColumnLayout({ order: defaults.order, visible, widths }, defaults);
}

export function normalizeColumnLayout(raw: unknown, defaults: ColumnLayoutDefaults): ColumnLayout {
  const min = defaults.minWidth ?? DEFAULT_MIN;
  const max = defaults.maxWidth ?? DEFAULT_MAX;
  const known = new Set(defaults.order);
  const pinned = (defaults.pinnedOrder ?? []).filter((id) => known.has(id));
  const required = new Set((defaults.requiredVisible ?? []).filter((id) => known.has(id)));
  const source = raw && typeof raw === 'object' ? (raw as { order?: unknown; visible?: unknown; widths?: unknown }) : {};

  const seen = new Set<string>();
  const order: string[] = [];
  if (Array.isArray(source.order)) {
    for (const id of source.order) {
      if (typeof id !== 'string' || !known.has(id) || seen.has(id)) continue;
      seen.add(id);
      order.push(id);
    }
  }
  for (const id of defaults.order) {
    if (!seen.has(id)) order.push(id);
  }
  for (let i = 0; i < pinned.length; i++) {
    const pin = pinned[i]!;
    const idx = order.indexOf(pin);
    if (idx !== i) {
      order.splice(idx, 1);
      order.splice(i, 0, pin);
    }
  }

  const visible: Record<string, boolean> = {};
  const widths: Record<string, number> = {};
  const rawVisible = source.visible && typeof source.visible === 'object' ? (source.visible as Record<string, unknown>) : {};
  const rawWidths = source.widths && typeof source.widths === 'object' ? (source.widths as Record<string, unknown>) : {};
  for (const id of defaults.order) {
    const flag = rawVisible[id];
    visible[id] = required.has(id) ? true : typeof flag === 'boolean' ? flag : defaults.visible[id] !== false;
    const width = rawWidths[id];
    widths[id] = clampWidth(typeof width === 'number' ? width : defaults.widths?.[id] ?? DEFAULT_WIDTH, min, max);
  }
  return { order, visible, widths };
}

export function storageKeyForTable(tableId: string) {
  return `jkbalaji.table.${tableId}.v1`;
}

export function loadColumnLayout(key: string, defaults: ColumnLayoutDefaults): ColumnLayout {
  if (typeof window === 'undefined') return defaultColumnLayout(defaults);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultColumnLayout(defaults);
    return normalizeColumnLayout(JSON.parse(raw), defaults);
  } catch {
    return defaultColumnLayout(defaults);
  }
}

export function saveColumnLayout(key: string, layout: ColumnLayout, defaults: ColumnLayoutDefaults): ColumnLayout {
  const normalized = normalizeColumnLayout(layout, defaults);
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(normalized));
  return normalized;
}

export function resetColumnLayout(key: string, defaults: ColumnLayoutDefaults): ColumnLayout {
  const layout = defaultColumnLayout(defaults);
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(layout));
  return layout;
}

export function moveColumn(order: string[], fromId: string, toId: string, pinnedOrder: string[] = []) {
  if (fromId === toId) return order;
  if (pinnedOrder.includes(fromId) || pinnedOrder.includes(toId)) return order;
  const next = [...order];
  const from = next.indexOf(fromId);
  const to = next.indexOf(toId);
  if (from < 0 || to < 0) return order;
  next.splice(from, 1);
  next.splice(to, 0, fromId);
  return next;
}
