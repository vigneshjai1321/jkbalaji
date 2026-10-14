import type { ReactNode } from 'react';
import { RealEstateNavbar } from './RealEstateNavbar';
import { RealEstateFooter } from '@/components/site/RealEstateFooter';
import ScrollReveal from '@/components/ScrollReveal';
import WhatsAppButton from '@/components/WhatsAppButton';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';

export function RealEstatePageShell({
  children,
  whatsappText = 'Property enquiry — JK Balaji Real Estate',
}: {
  children: ReactNode;
  whatsappText?: string;
}) {
  return (
    <>
      <RealEstateNavbar />
      <main className="bg-slate-50 text-slate-900 overflow-x-hidden min-h-[60vh]">
        <ScrollReveal>{children}</ScrollReveal>
      </main>
      <RealEstateFooter />
      <WhatsAppButton phone={JK_BALAJI_RE.whatsappNumber} text={whatsappText} />
    </>
  );
}
