'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';

type Customer360 = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  gstin: string | null;
  address: string | null;
  invoices: { id: string; invoiceNo: string; totalInr: string; invoiceDate: string }[];
  plots: { plotNumber: string; status: string; project: { name: string } | null }[];
};

export default function CustomerViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery({
    queryKey: ['customer-360', id],
    queryFn: () => adminFetch<Customer360>(`/billing/customers/${id}`),
  });

  if (!data) return <div className="p-8 text-sm opacity-60">Loading…</div>;

  return (
    <div className="space-y-6">
      <AdminPanel
        title={data.name}
        description="360° customer view"
        actions={
          <Link href={`/customers/${id}/edit`} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Edit
          </Link>
        }
      >
        <dl className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="opacity-60">Phone</dt>
            <dd className="font-semibold">{data.phone}</dd>
          </div>
          <div>
            <dt className="opacity-60">Email</dt>
            <dd className="font-semibold">{data.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="opacity-60">GSTIN</dt>
            <dd className="font-semibold">{data.gstin ?? '—'}</dd>
          </div>
          <div>
            <dt className="opacity-60">Address</dt>
            <dd className="font-semibold">{data.address ?? '—'}</dd>
          </div>
        </dl>
      </AdminPanel>
      <AdminPanel title="Gold purchase history">
        <AdminTable
          headers={['Invoice', 'Date', 'Total']}
          rows={data.invoices.map((i) => [
            i.invoiceNo,
            new Date(i.invoiceDate).toLocaleDateString('en-IN'),
            `₹${Number(i.totalInr).toLocaleString('en-IN')}`,
          ])}
        />
      </AdminPanel>
      <AdminPanel title="Property / plot history">
        <AdminTable
          headers={['Plot', 'Project', 'Status']}
          rows={data.plots.map((p) => [p.plotNumber, p.project?.name ?? '—', p.status])}
        />
      </AdminPanel>
    </div>
  );
}
