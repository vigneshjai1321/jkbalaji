'use client';

import { useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/billing/InvoiceForm';

export default function NewInvoicePage() {
  const router = useRouter();

  return (
    <div className="w-full max-w-none min-h-full -mx-2 sm:-mx-0 px-2 sm:px-0 pb-2 bg-gradient-to-b from-stone-100/90 via-amber-50/25 to-stone-50">
      <InvoiceForm mode="create" onSaved={(id) => router.push(`/billing/invoices/${id}`)} />
    </div>
  );
}
