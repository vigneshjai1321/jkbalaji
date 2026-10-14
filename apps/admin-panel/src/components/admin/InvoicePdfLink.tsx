'use client';

import { adminApiBase } from '../../lib/admin-api';

export function InvoicePdfLink({ id }: { id: string }) {
  async function openPdf() {
    const token = localStorage.getItem('jk_token');
    const res = await fetch(`${adminApiBase()}/admin/billing/invoices/${id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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
