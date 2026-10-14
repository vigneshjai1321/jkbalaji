import Link from 'next/link';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { RealEstateNavbar } from '@/components/realestate/RealEstateNavbar';
import { RealEstateFooter } from '@/components/site/RealEstateFooter';
import { realEstateImages } from '@/lib/site-images';
import { realEstateBase } from '@/lib/site-paths';
import { apiGet } from '@/lib/api';

export default async function PropertyDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = await apiGet<Record<string, unknown>>(`/public/properties/${slug}`).catch(() => null);

  if (!property) {
    return (
      <>
        <RealEstateNavbar />
        <main className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-slate-50">
          <p className="text-lg font-semibold">Property Not Found</p>
          <Link href={realEstateBase()} className="mt-4 text-emerald-700 underline">
            Back to Listings
          </Link>
        </main>
        <RealEstateFooter />
      </>
    );
  }

  const img = realEstateImages.gallery[0]!.src;

  return (
    <>
      <RealEstateNavbar />
      <main className="min-h-screen bg-slate-50 pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-4">
          <Link href={`${realEstateBase()}#properties`} className="text-sm text-emerald-700 font-medium hover:underline">
            ← Back to Properties
          </Link>
          <div className="mt-6 rounded-2xl overflow-hidden bg-white border shadow-lg">
            <img
              src={img}
              alt={String(property.title)}
              width={1200}
              height={675}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="p-6 md:p-8">
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-950">{String(property.title)}</h1>
              <p className="text-slate-600 mt-2">{String(property.location)}</p>
              <p className="mt-4 text-2xl font-bold text-emerald-800">₹ {Number(property.priceInr).toLocaleString('en-IN')}</p>
              {property.description ? <p className="mt-4 text-slate-700 leading-relaxed">{String(property.description)}</p> : null}
              <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-bold">Enquire About This Property</h2>
                <ContactLeadForm site="REAL_ESTATE" propertyId={String(property.id)} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <RealEstateFooter />
    </>
  );
}
