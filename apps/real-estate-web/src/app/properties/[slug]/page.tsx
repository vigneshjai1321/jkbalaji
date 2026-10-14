import Link from 'next/link';
import type { Metadata } from 'next';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { SiteImage } from '@/components/site/SiteImage';
import { resolvePublicAssetUrl } from '@/lib/site-asset-url';
import { RE_ROUTES } from '@/lib/site-routes';
import { apiGet } from '@/lib/api';

type Property = Record<string, unknown> & {
  id: string;
  title: string;
  slug: string;
  location: string;
  priceInr: string;
  description?: string | null;
  images?: string[];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await apiGet<Property>(`/public/properties/${slug}`).catch(() => null);
  if (!property) return { title: 'Property | JK Balaji Real Estate' };
  return {
    title: `${property.title} | JK Balaji Real Estate`,
    description: property.description?.slice(0, 160) ?? `Plot in ${property.location}`,
    alternates: { canonical: `https://jkbalaji.in/properties/${slug}` },
  };
}

export default async function PropertyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await apiGet<Property>(`/public/properties/${slug}`).catch(() => null);

  if (!property) {
    return (
      <RealEstatePageShell>
        <div className="re-container py-20 text-center">
          <p className="text-lg font-semibold">Property not found</p>
          <Link href={RE_ROUTES.properties} className="mt-4 inline-block text-emerald-700 underline">
            Back to listings
          </Link>
        </div>
      </RealEstatePageShell>
    );
  }

  const raw = property.images?.[0]?.trim();
  const img = raw ? resolvePublicAssetUrl(raw) : null;

  return (
    <RealEstatePageShell whatsappText={`Enquiry: ${property.title}`}>
      <div className="re-container py-10 md:py-14 max-w-4xl">
        <Link href={RE_ROUTES.properties} className="text-sm text-emerald-700 font-medium hover:underline">
          ← Back to properties
        </Link>
        <article className="mt-6 rounded-2xl overflow-hidden bg-white border shadow-lg">
          <div className="relative h-64 md:h-80 bg-slate-100">
            {img ? (
              <SiteImage src={img} alt={`${property.title} listing photo`} fill sizes="100vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 px-6 text-center">
                Listing photo not uploaded — contact us for site images.
              </div>
            )}
          </div>
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-emerald-950">{String(property.title)}</h1>
            <p className="text-slate-600 mt-2">{String(property.location)}</p>
            <p className="mt-4 text-2xl font-bold text-emerald-800 tabular-nums">
              ₹ {Number(property.priceInr).toLocaleString('en-IN')}
            </p>
            {property.description ? <p className="mt-4 text-slate-700 leading-relaxed">{String(property.description)}</p> : null}
            <div className="mt-8 border-t pt-8">
              <h2 className="text-xl font-bold">Enquire about this property</h2>
              <ContactLeadForm site="REAL_ESTATE" propertyId={String(property.id)} sourcePage={`/properties/${slug}`} />
            </div>
          </div>
        </article>
      </div>
    </RealEstatePageShell>
  );
}
