'use client';

import { useRouter } from 'next/navigation';
import { InvoiceForm } from '@/components/billing/InvoiceForm';

export default function NewInvoicePage() {
  const router = useRouter();

  return <InvoiceForm mode="create" onSaved={(id) => router.push(`/billing/invoices/${id}`)} />;
}
