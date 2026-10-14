'use client';

import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type BusinessKey = 'all' | 'real-estate' | 'jewellery';

const STORAGE_KEY = 'jk_admin_business';

const BusinessContext = createContext<{
  business: BusinessKey;
  setBusiness: (business: BusinessKey) => void;
}>({ business: 'all', setBusiness: () => {} });

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [business, setBusinessState] = useState<BusinessKey>('all');

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === 'all' || stored === 'real-estate' || stored === 'jewellery') setBusinessState(stored);
  }, []);

  const setBusiness = (next: BusinessKey) => {
    setBusinessState(next);
    sessionStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ business, setBusiness }), [business]);
  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
}

export function useBusiness() {
  return useContext(BusinessContext);
}

/** Keep header business in sync when opening a business overview from the sidebar. */
export function BusinessPathSync() {
  const pathname = usePathname();
  const { setBusiness } = useBusiness();

  useEffect(() => {
    if (pathname === '/overview/real-estate') setBusiness('real-estate');
    else if (pathname === '/overview/jewellery') setBusiness('jewellery');
    else if (pathname === '/') setBusiness('all');
  }, [pathname, setBusiness]);

  return null;
}
