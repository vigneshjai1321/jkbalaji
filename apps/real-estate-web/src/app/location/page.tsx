import { MapEmbed } from '@/components/site/MapEmbed';
import { reStaticMetadata } from '@/lib/seo/metadata';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReLocationContactStrip, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';

export const metadata = reStaticMetadata('location');

export default function LocationPage() {
  return (
    <RealEstatePageShell>
      <RePageHeader eyebrow="Visit" title="Location & Map" description={JK_BALAJI_RE.location} />
      <div className="re-container pb-6 md:pb-8 max-w-3xl">
        <MapEmbed title={JK_BALAJI_RE.name} />
      </div>
      <ReLocationContactStrip />
    </RealEstatePageShell>
  );
}
