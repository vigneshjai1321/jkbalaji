import type { ReactNode } from 'react';
import { JewelleryNavbar } from '@/components/jewellery/JewelleryNavbar';
import { JewelleryFooter } from '@/components/jewellery/JewelleryFooter';

export function LegalPageChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <JewelleryNavbar />
      <div className="pt-[4.25rem] min-h-[50vh]">{children}</div>
      <JewelleryFooter />
    </>
  );
}
