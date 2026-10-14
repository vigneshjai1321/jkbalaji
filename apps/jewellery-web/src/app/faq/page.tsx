import { jwStaticMetadata } from '@/lib/seo/metadata';
import { FaqSection } from '@/components/site/FaqSection';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';
import { JwFaqContactCta } from '@/components/jewellery/inner/JwInnerBlocks';

export const metadata = jwStaticMetadata('faq');

export default function FaqPage() {
  return (
    <JewelleryPageShell>
      <FaqSection
        title="Frequently Asked Questions"
        items={[
          { q: 'Do you sell online?', a: 'We serve customers in our Cheyyar showroom. Use the contact form or phone to enquire before visiting.' },
          { q: 'Are photos on the website current stock?', a: 'Gallery and collection images are illustrative — visit us to see available pieces.' },
          { q: 'What do the gold rates on this website mean?', a: 'They are MJDTA reference rates from kjpl.in for information. Showroom selling prices depend on purity, making charges, GST, and shop policy.' },
          { q: 'How are making charges calculated?', a: 'Making charges vary by piece and are explained at billing in the showroom — ask our staff when you visit.' },
          { q: 'How do I join the gold savings scheme?', a: 'Use the gold scheme enquiry form or call our scheme line — enrolment and payment are completed in person with approved terms.' },
        ]}
      />
      <JwFaqContactCta />
    </JewelleryPageShell>
  );
}
