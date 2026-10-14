import type { ReactNode } from 'react';
import { RealEstateNavbar } from '../realestate/RealEstateNavbar';
import { RealEstateFooter } from './RealEstateFooter';

export function LegalPageChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <RealEstateNavbar />
      <div className="pt-[4.25rem] min-h-[50vh]">{children}</div>
      <RealEstateFooter />
    </>
  );
}
