import type { Metadata } from 'next';
import { FaqSection } from '@/components/site/FaqSection';
import { JewelleryPageShell } from '@/components/jewellery/JewelleryPageShell';

export const metadata: Metadata = {
  title: 'FAQs | Sri Balaji Thangamaligai',
  description: 'Common questions about visiting our Cheyyar jewellery showroom.',
  alternates: { canonical: 'https://cheyyarbalaji.com/faq' },
};

export default function FaqPage() {
  return (
    <JewelleryPageShell>
      <FaqSection
        title="Frequently Asked Questions"
        items={[
          { q: 'Do you sell online?', a: 'We serve customers in our Cheyyar showroom. Use the contact form or phone to enquire before visiting.' },
          { q: 'Are photos on the website current stock?', a: 'Gallery and collection images are illustrative — visit us to see available pieces.' },
          { q: 'How do I join the gold savings scheme?', a: 'Visit or call our showroom — our team explains enrolment in person.' },
        ]}
      />
    </JewelleryPageShell>
  );
}
