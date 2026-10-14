'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';
import { AdminRowActions } from '@/components/admin/AdminRowActions';

type Product = {
  id: string;
  name: string;
  category: string;
  weightGrams: string;
  makingCharge: string;
  inStock: boolean;
};

export default function AdminJewelleryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => adminFetch<Product[]>('/products'),
  });

  return (
    <AdminPanel
      title="Jewellery catalogue"
      description="Gold, silver, diamond & platinum — cheyyarbalaji.com."
      actions={
        <Link href="/jewellery/new" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Add product
        </Link>
      }
    >
      {isLoading ? (
        <div className="p-8 animate-pulse text-sm text-slate-500">Loading products…</div>
      ) : (
        <AdminTable
          headers={['Product', 'Category', 'Weight (g)', 'Making charge', 'Stock', 'Actions']}
          rows={(data ?? []).map((p) => [
            p.name,
            p.category,
            Number(p.weightGrams).toFixed(3),
            `₹${Number(p.makingCharge).toLocaleString('en-IN')}`,
            p.inStock ? 'In stock' : 'Out',
            <AdminRowActions key={p.id} base="/jewellery" id={p.id} />,
          ])}
        />
      )}
    </AdminPanel>
  );
}
