/** Suggest due date from payment terms like "Net 30" or "15 days". */
export function suggestDueDateFromTerms(invoiceDate: string, paymentTerms: string): string | null {
  if (!invoiceDate || !paymentTerms.trim()) return null;
  const m = paymentTerms.match(/(?:net\s*)?(\d+)\s*days?/i);
  if (!m) return null;
  const days = Number(m[1]);
  if (!Number.isFinite(days) || days < 0 || days > 3650) return null;
  const d = new Date(invoiceDate + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
