import type { ReactNode } from 'react';
import { JewelleryNavbar } from './JewelleryNavbar';
import { JewelleryFooter } from './JewelleryFooter';
import WhatsAppButton from '@/components/WhatsAppButton';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export function JewelleryPageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <JewelleryNavbar />
      <main>{children}</main>
      <JewelleryFooter />
      <WhatsAppButton phone={SRI_BALAJI.whatsappNumber} text="Jewellery enquiry — Sri Balaji Thangamaligai" />
    </>
  );
}
