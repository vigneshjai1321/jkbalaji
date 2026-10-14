import type { Metadata } from 'next';
import { ContactLeadForm } from '@/components/ContactLeadForm';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export const metadata: Metadata = {
  title: 'Contact Us | Sri Balaji Thangamaligai',
  description: 'Contact Sri Balaji Thangamaligai jewellery showroom in Cheyyar.',
  alternates: { canonical: 'https://cheyyarbalaji.com/contact' },
};

export default function ContactPage() {
  return (
    <JewelleryPageShell>
      <section className="jw-section">
        <div className="jw-container grid lg:grid-cols-2 gap-10">
          <div>
            <h1 className="jw-heading text-3xl font-semibold text-stone-900">Contact Us</h1>
            <p className="mt-3 text-stone-600">{SRI_BALAJI.addressLine}</p>
            <p className="mt-4 text-sm">
              Phone:{' '}
              <a href={`tel:${SRI_BALAJI.phoneE164}`} className="text-amber-900 font-medium">
                {SRI_BALAJI.phoneDisplay}
              </a>
            </p>
            <div className="mt-8">
              <ContactLeadForm sourcePage="/contact" />
            </div>
          </div>
          <div className="text-sm text-stone-600 space-y-2">
            <p>{SRI_BALAJI.hours.open}</p>
            <p>{SRI_BALAJI.hours.closed}</p>
            <p className="pt-4">{SRI_BALAJI.gstNote}</p>
          </div>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
