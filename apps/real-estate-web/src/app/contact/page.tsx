import { ContactLeadForm } from '@/components/ContactLeadForm';
import { reStaticMetadata } from '@/lib/seo/metadata';
import { MapEmbed } from '@/components/site/MapEmbed';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReContactGuide, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';

export const metadata = reStaticMetadata('contact');

export default function ContactPage() {
  return (
    <RealEstatePageShell>
      <RePageHeader eyebrow="Contact" title="Enquire About a Property" description="We respond within one business day." />
      <div className="re-container pb-6 md:pb-8 grid gap-8 lg:grid-cols-2">
        <div>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li>
              <a href={`tel:${JK_BALAJI_RE.phoneE164}`} className="text-emerald-800 font-medium hover:underline">
                {JK_BALAJI_RE.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${JK_BALAJI_RE.email}`} className="text-emerald-800 hover:underline break-all">
                {JK_BALAJI_RE.email}
              </a>
            </li>
          </ul>
          <ContactLeadForm site="REAL_ESTATE" sourcePage="/contact" />
        </div>
        <MapEmbed title="Find us" />
      </div>
      <ReContactGuide />
    </RealEstatePageShell>
  );
}
