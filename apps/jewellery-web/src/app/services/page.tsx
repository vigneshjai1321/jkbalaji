import type { Metadata } from 'next';
import Link from 'next/link';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JW_ROUTES } from '@/lib/site-routes';

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
      <section className="jw-section">
        <div className="jw-container max-w-3xl">
          <h1 className="jw-heading text-3xl font-semibold text-stone-900">Services & Trust</h1>
          <ul className="mt-8 space-y-6">
            {SERVICES.map((s) => (
              <li key={s.title} className="jw-card p-6">
                <h2 className="font-semibold text-stone-900">{s.title}</h2>
                <p className="mt-2 text-sm text-stone-600">{s.desc}</p>
              </li>
            ))}
          </ul>
          <Link href={JW_ROUTES.contact} className="jw-btn-gold inline-flex mt-10">
            Contact showroom
          </Link>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
