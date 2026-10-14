import type { Metadata } from 'next';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
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
      <section className="jw-section">
        <div className="jw-container grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="jw-heading text-3xl font-semibold text-stone-900">About {SRI_BALAJI.name}</h1>
            <p className="mt-4 text-stone-600 leading-relaxed">
              {SRI_BALAJI.name} is a trusted jewellery showroom on Gandhi Road, Cheyyar. {SRI_BALAJI.experience}.{' '}
              {SRI_BALAJI.gstNote}.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-md relative aspect-[4/3]">
            <SiteImage src={jewelleryImages.bridal} alt="Illustrative jewellery showroom photography" fill sizes="(max-width:768px) 100vw, 50vw" />
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
