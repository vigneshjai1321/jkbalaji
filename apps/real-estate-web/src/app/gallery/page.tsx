import type { Metadata } from 'next';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { SiteImage } from '@/components/site/SiteImage';
import { realEstateImages } from '@/lib/site-images';

export const metadata: Metadata = {
  title: 'Project Gallery | JK Balaji Real Estate',
  description: 'Sample layout and development photography from JK Balaji Real Estate projects.',
  alternates: { canonical: 'https://jkbalaji.in/gallery' },
};

export default function GalleryPage() {
  return (
    <RealEstatePageShell>
      <div className="re-container py-10 md:py-14">
        <p className="re-eyebrow">Gallery</p>
        <h1 className="re-heading mt-2">Project Gallery</h1>
        <p className="re-subheading mt-3 max-w-2xl">
          Sample photography from our developments. Ask our team for photos of the layout you are interested in.
        </p>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {realEstateImages.gallery.map((g) => (
            <div key={g.src} className="aspect-square rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-200/60 relative">
              <SiteImage src={g.src} alt={g.alt} fill sizes="(max-width:768px) 50vw, 25vw" className="hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
    </RealEstatePageShell>
  );
}
