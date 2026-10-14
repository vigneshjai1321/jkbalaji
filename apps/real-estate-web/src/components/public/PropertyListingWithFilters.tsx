'use client';

import { useMemo, useState } from 'react';
import { PropertyShowcaseCard } from '@/components/public/PropertyShowcaseCard';
import { resolvePublicAssetUrl } from '@/lib/site-asset-url';

export type ListingProperty = {
  id: string;
  title: string;
  slug: string;
  location: string;
  priceInr: string;
  images?: string[];
};

export function PropertyListingWithFilters({ properties }: { properties: ListingProperty[] }) {
  const [location, setLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const locations = useMemo(() => {
    const set = new Set(properties.map((p) => p.location.trim()).filter(Boolean));
    return Array.from(set).sort();
  }, [properties]);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (location && p.location !== location) return false;
      if (maxPrice) {
        const max = Number(maxPrice);
        if (Number.isFinite(max) && Number(p.priceInr) > max) return false;
      }
      return true;
    });
  }, [properties, location, maxPrice]);

  return (
    <>
      {properties.length > 0 ? (
        <div className="mt-8 flex flex-wrap gap-4 items-end">
          <label className="text-sm">
            <span className="block text-slate-600 mb-1">Location</span>
            <select
              className="rounded-lg border border-slate-200 px-3 py-2 min-w-[10rem]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">All</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-slate-600 mb-1">Max budget (₹)</span>
            <input
              type="number"
              min={0}
              className="rounded-lg border border-slate-200 px-3 py-2 w-40"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </label>
        </div>
      ) : null}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const img = p.images?.[0]?.trim();
          return (
            <PropertyShowcaseCard
              key={p.id}
              title={p.title}
              location={p.location}
              priceInr={p.priceInr}
              slug={p.slug}
              imageUrl={img ? resolvePublicAssetUrl(img) : null}
            />
          );
        })}
      </div>
      {properties.length > 0 && filtered.length === 0 ? (
        <p className="mt-8 text-slate-600">No listings match your filters — try clearing filters or contact us.</p>
      ) : null}
    </>
  );
}
