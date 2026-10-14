import type { Metadata } from 'next';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwAboutTrustStrip, JwPageHeader, JwShowroomCtaBar } from '@/components/jewellery/inner/JwInnerBlocks';
import { SiteImage } from '@/components/site/SiteImage';
import { SRI_BALAJI } from '@/lib/jewellery-business';
import { jewelleryImages } from '@/lib/site-images';

export const metadata: Metadata = {
  title: 'About Us | Sri Balaji Thangamaligai',
  description: `About ${SRI_BALAJI.name} — trusted jewellery showroom on Gandhi Road, Cheyyar.`,
  alternates: { canonical: 'https://cheyyarbalaji.com/about' },
};

export default function AboutPage() {
  return (
    <JewelleryPageShell>
      <JwPageHeader eyebrow="Our story" title={`About ${SRI_BALAJI.name}`} description={`${SRI_BALAJI.experience} ${SRI_BALAJI.gstNote}.`} />
      <section className="jw-section-inner pt-0">
        <div className="jw-container grid lg:grid-cols-2 gap-6 items-center">
          <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm relative aspect-[4/3] lg:order-2">
            <SiteImage src={jewelleryImages.bridal} alt="Illustrative jewellery showroom photography" fill sizes="(max-width:768px) 100vw, 50vw" />
          </div>
          <p className="text-sm text-stone-600 leading-relaxed lg:order-1">
            We serve customers from our Gandhi Road showroom in Cheyyar. Website collections and gallery images are illustrative —
            visit us to see current pieces, weights, and pricing.
          </p>
        </div>
      </section>
      <JwAboutTrustStrip />
      <JwShowroomCtaBar />
    </JewelleryPageShell>
  );
}
