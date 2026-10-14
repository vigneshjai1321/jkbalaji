import type { Metadata } from 'next';
import { JewelleryMap } from '@/components/jewellery/JewelleryMap';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader } from '@/components/jewellery/inner/JwInnerBlocks';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export const metadata: Metadata = {
  title: 'Visit Our Showroom | Sri Balaji Thangamaligai',
  description: 'Showroom location, hours, and directions — Gandhi Road, Cheyyar.',
  alternates: { canonical: 'https://cheyyarbalaji.com/visit' },
};

export default function VisitPage() {
  return (
    <JewelleryPageShell>
      <JwPageHeader
        eyebrow="Visit"
        title="Visit Our Showroom"
        description={SRI_BALAJI.addressLine}
      />
      <section className="jw-section-inner pt-0">
        <div className="jw-container max-w-3xl">
          <p className="text-sm text-stone-600">{SRI_BALAJI.hours.open}</p>
          <p className="text-sm text-stone-600">{SRI_BALAJI.hours.closed}</p>
          <a href={SRI_BALAJI.directionsUrl} className="jw-btn-outline inline-flex mt-4 text-sm">
            Get directions
          </a>
          <div className="mt-6">
            <JewelleryMap />
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
