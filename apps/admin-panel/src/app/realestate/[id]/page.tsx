'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';

export default function PropertyViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery({
    queryKey: ['property', id],
    queryFn: () =>
      adminFetch<{ title: string; location: string; status: string; priceInr: string; description: string | null }>(
        `/properties/${id}`,
      ),
  });

  if (!data) return <div className="p-8 text-sm opacity-60">Loading…</div>;

  return (
    <AdminPanel
      title={data.title}
      actions={
        <Link href={`/realestate/${id}/edit`} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Edit
        </Link>
      }
    >
      <dl className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="opacity-60">Location</dt>
          <dd className="font-semibold">{data.location}</dd>
        </div>
        <div>
          <dt className="opacity-60">Status</dt>
          <dd className="font-semibold">{data.status}</dd>
        </div>
        <div>
          <dt className="opacity-60">Price</dt>
          <dd className="font-semibold">₹{Number(data.priceInr).toLocaleString('en-IN')}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="opacity-60">Description</dt>
          <dd className="font-semibold">{data.description ?? '—'}</dd>
        </div>
      </dl>
    </AdminPanel>
  );
}
