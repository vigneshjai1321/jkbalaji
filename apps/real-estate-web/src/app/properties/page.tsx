import type { Metadata } from 'next';
import Link from 'next/link';
import { PropertyListingWithFilters } from '@/components/public/PropertyListingWithFilters';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { apiGet } from '@/lib/api';
import { RE_ROUTES } from '@/lib/site-routes';

export const metadata: Metadata = {
  title: 'Available Properties & Plots | JK Balaji Real Estate',
  description: 'Browse published residential plots and properties from JK Balaji Real Estate.',
  alternates: { canonical: 'https://jkbalaji.in/properties' },
};

type Property = {
  id: string;
  title: string;
  slug: string;
  location: string;
  priceInr: string;
  images?: string[];
};

export default async function PropertiesPage() {
  let properties: Property[] = [];
  try {
    properties = await apiGet<Property[]>('/public/properties');
  } catch {
    properties = [];
  }

  return (
    <RealEstatePageShell>
      <div className="re-container py-10 md:py-14">
        <p className="re-eyebrow">Portfolio</p>
        <h1 className="re-heading mt-2">Available Properties & Plots</h1>
        <p className="re-subheading mt-3 max-w-2xl">
          Live listings from our system. Each card uses the property&apos;s own photo when uploaded in admin; otherwise we show a
          neutral layout placeholder — not a specific plot photo.
        </p>
        {properties.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 max-w-2xl">
            <p className="text-slate-800 font-medium">No published listings right now</p>
            <p className="text-sm text-slate-600 mt-2">
              JK Nagar phases and new layouts are actively marketed — speak to our team for the latest plots.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={RE_ROUTES.jkNagar}
                className="inline-flex rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-900"
              >
                JK Nagar overview
              </Link>
              <Link
                href={RE_ROUTES.contact}
                className="inline-flex rounded-xl border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
              >
                Contact us
              </Link>
            </div>
          </div>
        ) : (
          <PropertyListingWithFilters properties={properties} />
        )}
      </div>
    </RealEstatePageShell>
  );
}
