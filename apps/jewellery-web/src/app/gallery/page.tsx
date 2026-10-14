import type { Metadata } from 'next';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader, JwShowroomCtaBar } from '@/components/jewellery/inner/JwInnerBlocks';
import { SiteImage } from '@/components/site/SiteImage';
import { jewelleryImages } from '@/lib/site-images';

export const metadata: Metadata = {
  title: 'Gallery | Sri Balaji Thangamaligai',
  description: 'Illustrative jewellery photography from Sri Balaji Thangamaligai.',
  alternates: { canonical: 'https://cheyyarbalaji.com/gallery' },
};

export default function GalleryPage() {
  return (
    <JewelleryPageShell>
      <JwPageHeader
        eyebrow="Gallery"
        title="Showroom & Collections"
        description="Illustrative photography — not specific in-store inventory."
      />
      <section className="jw-section-inner pt-0">
        <div className="jw-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {jewelleryImages.gallery.map((g) => (
              <div key={g.src} className="aspect-square rounded-lg overflow-hidden border border-stone-200 relative">
                <SiteImage src={g.src} alt={g.alt} fill sizes="(max-width:768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <JwShowroomCtaBar />
    </JewelleryPageShell>
  );
}
