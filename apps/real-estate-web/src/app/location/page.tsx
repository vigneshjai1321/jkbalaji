import type { Metadata } from 'next';
import { MapEmbed } from '@/components/site/MapEmbed';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';

export const metadata: Metadata = {
  title: 'Location & Map | JK Balaji Real Estate',
  description: 'JK Balaji Real Estate office location in Cheyyar, Tamil Nadu.',
  alternates: { canonical: 'https://jkbalaji.in/location' },
};

export default function LocationPage() {
  return (
    <RealEstatePageShell>
      <div className="re-container py-10 md:py-14">
        <p className="re-eyebrow">Visit</p>
        <h1 className="re-heading mt-2">Location & Map</h1>
        <p className="re-subheading mt-3 max-w-2xl">{JK_BALAJI_RE.location}</p>
        <div className="mt-10">
          <MapEmbed title={JK_BALAJI_RE.name} />
        </div>
      </div>
    </RealEstatePageShell>
  );
}
