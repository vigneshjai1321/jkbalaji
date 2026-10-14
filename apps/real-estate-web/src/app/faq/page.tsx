import type { Metadata } from 'next';
import { FaqSection } from '@/components/site/FaqSection';
import { RealEstatePageShell } from '@/components/realestate/RealEstatePageShell';
import { ReFaqContactCta, RePageHeader } from '@/components/realestate/inner/ReInnerBlocks';

export const metadata: Metadata = {
  title: 'FAQs | JK Balaji Real Estate',
  description: 'Frequently asked questions about JK Balaji plots, DTCP layouts, and site visits.',
  alternates: { canonical: 'https://jkbalaji.in/faq' },
};

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
