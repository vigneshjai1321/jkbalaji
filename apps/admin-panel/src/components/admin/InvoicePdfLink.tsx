'use client';

import { adminApiBase, adminAuthHeaders } from '../../lib/admin-api';

export function InvoicePdfLink({ id }: { id: string }) {
  async function openPdf() {
    const res = await fetch(`${adminApiBase()}/admin/billing/invoices/${id}/pdf`, {
      headers: adminAuthHeaders(),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  return (
    <button type="button" onClick={openPdf} className="text-emerald-500 hover:underline text-xs font-medium">
      Open PDF
    </button>
  );
}
