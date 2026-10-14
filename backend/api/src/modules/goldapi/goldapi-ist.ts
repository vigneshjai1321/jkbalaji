const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Calendar date string YYYY-MM-DD in Asia/Kolkata (no DST). */
export function istDateString(d = new Date()): string {
  const ist = new Date(d.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
  const day = String(ist.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function istYearMonth(d = new Date()): string {
  const ist = new Date(d.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** Milliseconds until next 09:00 Asia/Kolkata. */
export function msUntilNextIstTime(hour: number, minute: number): number {
  const now = Date.now();
  const istNow = new Date(now + IST_OFFSET_MS);
  const target = new Date(istNow);
  target.setUTCHours(hour, minute, 0, 0);
  let targetMs = target.getTime() - IST_OFFSET_MS;
  if (targetMs <= now) {
    target.setUTCDate(target.getUTCDate() + 1);
    targetMs = target.getTime() - IST_OFFSET_MS;
  }
  return Math.max(1000, targetMs - now);
}
