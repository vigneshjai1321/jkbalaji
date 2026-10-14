'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/billing/InvoiceForm';

export default function NewInvoicePage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-none">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <Link href="/billing" className="text-emerald-700 hover:underline font-medium">
          ← Billing
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white text-slate-900 shadow-sm px-4 py-4 md:px-6 md:py-5">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-4 pb-3 border-b border-slate-200">
          Create Invoice
        </h1>
        <InvoiceForm mode="create" onSaved={(id) => router.push(`/billing/invoices/${id}`)} />
      </div>
    </div>
  );
}
