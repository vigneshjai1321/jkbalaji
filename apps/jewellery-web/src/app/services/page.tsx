import type { Metadata } from 'next';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader, JwShowroomCtaBar } from '@/components/jewellery/inner/JwInnerBlocks';

export const metadata: Metadata = {
  title: 'Services | Sri Balaji Thangamaligai',
  description: 'Custom design, buyback, and in-store collection assistance at our Cheyyar jewellery showroom.',
  alternates: { canonical: 'https://cheyyarbalaji.com/services' },
};

const SERVICES = [
  { title: 'Custom jewellery design', desc: 'Share your ideas — enquire in-store for design consultations.' },
  { title: 'Old gold buyback & exchange', desc: 'Ask our team about buyback and exchange when you visit.' },
  { title: 'Collection enquiries', desc: 'Gold, silver, platinum and diamond — we help you choose in person.' },
  { title: 'GST-compliant billing', desc: 'GST-compliant business documentation on purchase.' },
];

export default function ServicesPage() {
  return (
    <JewelleryPageShell>
      <JwPageHeader eyebrow="Showroom" title="Services & Trust" description="Services available in person at our Cheyyar showroom." />
      <section className="jw-section-inner pt-0">
        <div className="jw-container max-w-3xl">
          <ul className="space-y-3">
            {SERVICES.map((s) => (
              <li key={s.title} className="jw-card p-4 md:p-5">
                <h2 className="font-semibold text-stone-900 text-sm md:text-base">{s.title}</h2>
                <p className="mt-1 text-sm text-stone-600">{s.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <JwShowroomCtaBar primaryLabel="Contact showroom" primaryHref="/contact" />
    </JewelleryPageShell>
  );
}
