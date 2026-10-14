import type { Metadata } from 'next';
import { JewelleryMap } from '@/components/jewellery/JewelleryMap';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export const metadata: Metadata = {
  title: 'Visit Our Showroom | Sri Balaji Thangamaligai',
  description: 'Showroom location, hours, and directions — Gandhi Road, Cheyyar.',
  alternates: { canonical: 'https://cheyyarbalaji.com/visit' },
};

export default function VisitPage() {
  return (
    <JewelleryPageShell>
      <section className="jw-section">
        <div className="jw-container max-w-3xl">
          <h1 className="jw-heading text-3xl font-semibold text-stone-900">Visit Our Showroom</h1>
          <p className="mt-3 text-stone-600">{SRI_BALAJI.addressLine}</p>
          <p className="mt-2 text-sm text-stone-600">{SRI_BALAJI.hours.open}</p>
          <p className="text-sm text-stone-600">{SRI_BALAJI.hours.closed}</p>
          <a href={SRI_BALAJI.directionsUrl} className="jw-btn-outline inline-flex mt-6">
            Get directions
          </a>
          <div className="mt-10">
            <JewelleryMap />
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
