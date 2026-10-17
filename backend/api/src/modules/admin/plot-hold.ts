export type ManualHoldMeta = {
  type: 'MANUAL_HOLD';
  reason?: string;
  notes?: string;
  holdUntil?: string;
  customerId: string;
};

export function canPlaceManualHold(plotStatus: string): boolean {
  return plotStatus === 'AVAILABLE';
}

export function canReleaseManualHold(plotStatus: string, hasActiveQuotationReservation: boolean): boolean {
  if (plotStatus !== 'RESERVED') return false;
  if (hasActiveQuotationReservation) return false;
  return true;
}

export function serializeHoldDetail(meta: ManualHoldMeta): string {
  return JSON.stringify(meta);
}

export function parseHoldDetail(detail: string | null | undefined): ManualHoldMeta | null {
  if (!detail?.trim()) return null;
  try {
    const parsed = JSON.parse(detail) as ManualHoldMeta;
    if (parsed?.type === 'MANUAL_HOLD' && typeof parsed.customerId === 'string') return parsed;
  } catch {
    /* legacy plain-text detail */
  }
  return null;
}

export function latestManualHoldFromEvents(
  events: Array<{ action: string; detail: string | null; createdAt: Date }>,
): { meta: ManualHoldMeta | null; released: boolean } {
  const sorted = [...events].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  for (const ev of sorted) {
    if (ev.action === 'HOLD_RELEASED') return { meta: null, released: true };
    if (ev.action === 'HOLD') {
      return { meta: parseHoldDetail(ev.detail), released: false };
    }
  }
  return { meta: null, released: false };
}
