import { FaqSection } from '@/components/site/FaqSection';
import { reStaticMetadata } from '@/lib/seo/metadata';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReFaqContactCta, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';

export const metadata = reStaticMetadata('faq');

export default function FaqPage() {
  return (
    <RealEstatePageShell>
      <RePageHeader eyebrow="Help" title="Frequently Asked Questions" description="Quick answers — contact us for project-specific details." />
      <FaqSection
        compact
        title="Common questions"
        items={[
          { q: 'Are your layouts DTCP approved?', a: 'We prioritize DTCP-approved and legally verifiable layouts. Specific approvals are shared per project.' },
          { q: 'Do you operate outside Cheyyar?', a: 'Yes. We market and develop properties across Tamil Nadu.' },
          { q: 'How do I book a site visit?', a: 'Call us, use WhatsApp, or submit the enquiry form on our contact page.' },
        ]}
      />
      <ReFaqContactCta />
    </RealEstatePageShell>
  );
}
