import type { Metadata } from 'next';
import Link from 'next/link';
import { GoldSchemeEnquiry } from '@/components/jewellery/GoldSchemeEnquiry';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwPageHeader, JwSchemeProcessNote } from '@/components/jewellery/inner/JwInnerBlocks';
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
      <section className="jw-section-inner bg-gradient-to-b from-amber-50/80 to-[#faf8f4]">
        <div className="jw-container">
          <JwPageHeader
            title="Gold Savings Scheme"
            description="Choose a contribution level and send an enquiry — enrolment and payment happen in the showroom under approved shop policy."
          />
          <ul className="mt-4 space-y-1.5 text-sm text-stone-700 max-w-2xl list-disc pl-5">
            <li>No guaranteed returns, bonus gold, or promotional benefits are promised on this website.</li>
            <li>Online payment and enrolment are not active on this site.</li>
            <li>
              Call{' '}
              <a href={SRI_BALAJI.schemeTel} className="text-amber-900 font-medium underline">
                {SRI_BALAJI.schemePhoneDisplay}
              </a>{' '}
              for immediate assistance.
            </li>
          </ul>
        </div>
      </section>
      <JwSchemeProcessNote />
      <section className="jw-section-inner">
        <div className="jw-container">
          <GoldSchemeEnquiry />
        </div>
      </section>
      <section className="jw-section-inner bg-white border-t border-stone-100">
        <div className="jw-container max-w-3xl text-sm text-stone-600">
          <p>
            Scheme terms are provided at enrolment. See{' '}
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
