'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel } from '@/components/admin/AdminPanel';

export default function ProductViewPage() {
  const { id } = useParams<{ id: string }>();
  const { data } = useQuery({
    queryKey: ['product', id],
    queryFn: () =>
      adminFetch<{ name: string; category: string; weightGrams: string; makingCharge: string; purity: string | null; inStock: boolean }>(
        `/products/${id}`,
      ),
  });

  if (!data) return <div className="p-8 text-sm opacity-60">Loading…</div>;

  return (
    <AdminPanel
      title={data.name}
      actions={
        <Link href={`/jewellery/${id}/edit`} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Edit
        </Link>
      }
    >
      <dl className="p-6 grid sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="opacity-60">Category</dt>
          <dd className="font-semibold">{data.category}</dd>
        </div>
        <div>
          <dt className="opacity-60">Purity</dt>
          <dd className="font-semibold">{data.purity ?? '—'}</dd>
        </div>
        <div>
          <dt className="opacity-60">Weight</dt>
          <dd className="font-semibold">{Number(data.weightGrams).toFixed(3)} g</dd>
        </div>
        <div>
          <dt className="opacity-60">Making charge</dt>
          <dd className="font-semibold">₹{Number(data.makingCharge).toLocaleString('en-IN')}</dd>
        </div>
        <div>
          <dt className="opacity-60">Stock</dt>
          <dd className="font-semibold">{data.inStock ? 'In stock' : 'Out of stock'}</dd>
        </div>
      </dl>
    </AdminPanel>
  );
}
