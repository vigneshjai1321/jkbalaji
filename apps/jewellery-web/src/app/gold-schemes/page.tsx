import type { Metadata } from 'next';
import Link from 'next/link';
import { GoldSchemeEnquiry } from '@/components/jewellery/GoldSchemeEnquiry';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { SRI_BALAJI } from '@/lib/jewellery-business';
import { JW_ROUTES } from '@/lib/site-routes';

export const metadata: Metadata = {
  title: 'Gold Savings Scheme | Sri Balaji Thangamaligai',
  description: 'Plan your jewellery purchase with our gold savings scheme — enquire from ₹5,000 to ₹1,00,000.',
  alternates: { canonical: 'https://cheyyarbalaji.com/gold-schemes' },
};

export default function GoldSchemesPage() {
  return (
    <JewelleryPageShell>
      <section className="jw-section bg-gradient-to-b from-amber-50/80 to-[#faf8f4]">
        <div className="jw-container">
          <h1 className="jw-heading text-3xl md:text-4xl font-semibold text-stone-900">Gold Savings Scheme</h1>
          <p className="mt-4 text-stone-600 max-w-3xl leading-relaxed">
            Save towards your jewellery purchase at Sri Balaji Thangamaligai, Cheyyar. Use this page to choose a contribution level
            and send an enquiry — enrolment, payment frequency, maturity, and redemption rules are explained in person using our
            approved shop policy.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-stone-700 max-w-2xl list-disc pl-5">
            <li>No guaranteed returns, bonus gold, or promotional benefits are promised on this website.</li>
            <li>Online payment and enrolment are not active until configured with a verified payment provider and approved terms.</li>
            <li>Call <a href={SRI_BALAJI.schemeTel} className="text-amber-900 font-medium underline">{SRI_BALAJI.schemePhoneDisplay}</a> for immediate assistance.</li>
          </ul>
        </div>
      </section>
      <section className="jw-section">
        <div className="jw-container">
          <GoldSchemeEnquiry />
        </div>
      </section>
      <section className="jw-section bg-white border-t border-stone-100">
        <div className="jw-container max-w-3xl text-sm text-stone-600">
          <p>
            Scheme terms and conditions are provided at enrolment. See also{' '}
            <Link href={JW_ROUTES.faq} className="text-amber-900 underline">
              FAQs
            </Link>{' '}
            and{' '}
            <Link href={JW_ROUTES.contact} className="text-amber-900 underline">
              contact
            </Link>
            .
          </p>
        </div>
      </section>
    </JewelleryPageShell>
  );
}
