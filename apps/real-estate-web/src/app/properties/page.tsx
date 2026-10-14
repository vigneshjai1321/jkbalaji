import Link from 'next/link';
import { reStaticMetadata } from '@/lib/seo/metadata';
import { PropertyListingWithFilters } from '@/components/public/PropertyListingWithFilters';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReAvailabilityNote, ReEnquireCtaBar, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { apiGet } from '@/lib/api';
import { RE_ROUTES } from '@/lib/site-routes';

export const metadata = reStaticMetadata('properties');

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
      <RePageHeader
        eyebrow="Portfolio"
        title="Available Properties & Plots"
        description="Live listings from our system — photos when uploaded in admin; otherwise a neutral placeholder."
      />
      <div className="re-container pb-6 md:pb-8">
        {properties.length === 0 ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-6 max-w-2xl">
            <p className="text-slate-800 font-medium">No published listings right now</p>
            <p className="text-sm text-slate-600 mt-2">JK Nagar phases are actively marketed — speak to our team for the latest plots.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={RE_ROUTES.jkNagar} className="inline-flex rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-900">
                JK Nagar overview
              </Link>
              <Link href={RE_ROUTES.contact} className="inline-flex rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50">
                Contact us
              </Link>
            </div>
          </div>
        ) : (
          <PropertyListingWithFilters properties={properties} />
        )}
      </div>
      <ReAvailabilityNote />
      <ReEnquireCtaBar />
    </RealEstatePageShell>
  );
}
