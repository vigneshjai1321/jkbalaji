import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { reStaticMetadata } from '@/lib/seo/metadata';
import { RePageHeader, ReProjectsQuickLinks } from '@/components/realestate/inner/ReInnerBlocks';
import { SiteImage } from '@/components/site/SiteImage';
import { realEstateImages } from '@/lib/site-images';

export const metadata = reStaticMetadata('gallery');

export default function GalleryPage() {
  return (
    <RealEstatePageShell>
      <RePageHeader
        eyebrow="Gallery"
        title="Project Gallery"
        description="Sample photography from our developments. Ask our team for photos of the layout you are interested in."
      />
      <div className="re-container pb-6 md:pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {realEstateImages.gallery.map((g) => (
            <div key={g.src} className="aspect-square rounded-xl overflow-hidden shadow-sm ring-1 ring-slate-200/60 relative">
              <SiteImage src={g.src} alt={g.alt} fill sizes="(max-width:768px) 50vw, 25vw" className="hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      </div>
      <ReProjectsQuickLinks />
    </RealEstatePageShell>
  );
}
