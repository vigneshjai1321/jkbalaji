const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function normalizeGstin(raw?: string | null): string {
  return (raw ?? '').trim().toUpperCase();
}

/** User-facing hint only — not legal verification. */
export function gstinFormatHint(raw?: string | null): string | null {
  const g = normalizeGstin(raw);
  if (!g) return null;
  if (g.length !== 15) return 'GSTIN length should be 15 characters — please verify.';
  if (!GSTIN_RE.test(g)) return 'GSTIN format may be incorrect — please verify against your registration.';
  return null;
}
