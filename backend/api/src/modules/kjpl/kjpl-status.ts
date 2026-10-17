import type { KjplParsedRates } from './kjpl-parse.js';

export const KJPL_CACHE_KEY = 'kjpl_rates_cache_v1';
export const KJPL_SHOP_SILVER_KEY = 'shop_silver_rate_v1';
export const KJPL_STATUS_KEY = 'kjpl_fetch_status_v1';
export const KJPL_BOARD_KEY = 'kjpl_market_board_v1';
export const KJPL_NOTIF_SCOPE = '[JEWELLERY_KJPL]';
export const KJPL_FAILURE_TITLE = 'Gold Rate Update Failed';
export const KJPL_RECOVERY_TITLE = 'Gold Rates Restored';

export type KjplFetchStatus = {
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  lastErrorCategory: string | null;
  lastErrorMessage: string | null;
  nextScheduledAt: string | null;
  activeFailureNotificationId: string | null;
};

export function emptyKjplStatus(): KjplFetchStatus {
  return {
    lastAttemptAt: null,
    lastSuccessAt: null,
    lastErrorCategory: null,
    lastErrorMessage: null,
    nextScheduledAt: null,
    activeFailureNotificationId: null,
  };
}

export function validateKjplParsed(r: KjplParsedRates): boolean {
  const g = r.goldWithoutGstInr;
  const s = r.silverWithoutGstInr;
  if (!Number.isFinite(g) || !Number.isFinite(s)) return false;
  if (g < 1_000 || g > 500_000) return false;
  if (s < 10 || s > 500_000) return false;
  return true;
}

export function mjdtaDisplayHealth(
  cacheFetchedAt: string | null,
  lastAttemptAt: string | null,
  lastError: string | null,
  nowMs: number,
  staleAfterMs: number,
  updating: boolean,
): 'fresh' | 'stale' | 'unavailable' | 'updating' {
  if (updating) return 'updating';
  if (!cacheFetchedAt) return 'unavailable';
  const fetchedMs = new Date(cacheFetchedAt).getTime();
  const attemptMs = lastAttemptAt ? new Date(lastAttemptAt).getTime() : 0;
  const failedAfterCache = Boolean(lastError) && attemptMs > fetchedMs;
  if (failedAfterCache || !Number.isFinite(fetchedMs) || nowMs - fetchedMs > staleAfterMs) return 'stale';
  return 'fresh';
}

export function sanitizeKjplError(message: string): string {
  return message.replace(/\s+/g, ' ').trim().slice(0, 240);
}

export function isJewelleryScopedNotification(body: string): boolean {
  return body.startsWith(KJPL_NOTIF_SCOPE);
}
