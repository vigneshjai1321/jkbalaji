/** Format check only — not legal verification of registration. */
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function normalizeGstin(raw?: string | null): string {
  return (raw ?? '').trim().toUpperCase();
}

export function isGstinFormatValid(raw?: string | null): boolean {
  const g = normalizeGstin(raw);
  if (!g) return false;
  return GSTIN_RE.test(g);
}

export function gstinFormatIssue(raw?: string | null): string | null {
  const g = normalizeGstin(raw);
  if (!g) return null;
  if (g.length !== 15) return `GSTIN must be 15 characters (got ${g.length}).`;
  if (!GSTIN_RE.test(g)) return 'GSTIN format looks invalid — verify against the registration certificate.';
  return null;
}
