import type { Metadata } from 'next';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
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
      <section className="jw-section">
        <div className="jw-container">
          <h1 className="jw-heading text-3xl font-semibold text-stone-900">Gallery</h1>
          <p className="mt-2 text-stone-600">Illustrative jewellery photography — not specific in-store inventory.</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {jewelleryImages.gallery.map((g) => (
              <div key={g.src} className="aspect-square rounded-xl overflow-hidden border border-stone-200 relative">
                <SiteImage src={g.src} alt={g.alt} fill sizes="(max-width:768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
