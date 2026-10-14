import type { Metadata } from 'next';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { MapEmbed } from '@/components/site/MapEmbed';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';

export const metadata: Metadata = {
  title: 'Contact Us | JK Balaji Real Estate',
  description: 'Enquire about plots, JK Nagar phases, and JK Balaji real estate projects.',
  alternates: { canonical: 'https://jkbalaji.in/contact' },
};

export default function ContactPage() {
  return (
    <RealEstatePageShell>
      <div className="re-container py-10 md:py-14 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="re-eyebrow">Contact</p>
          <h1 className="re-heading mt-2">Enquire About a Property</h1>
          <p className="re-subheading mt-3">We respond within one business day.</p>
          <ul className="mt-6 space-y-2 text-sm text-slate-700">
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
          <div className="mt-8">
            <ContactLeadForm site="REAL_ESTATE" sourcePage="/contact" />
          </div>
        </div>
        <MapEmbed title="Find us" />
      </div>
    </RealEstatePageShell>
  );
}
