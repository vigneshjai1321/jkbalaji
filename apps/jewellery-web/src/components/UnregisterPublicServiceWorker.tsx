'use client';

import { useEffect } from 'react';

/** Public sites are not apps. Drop any previously registered service worker. */
export function UnregisterPublicServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    void navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => void r.unregister());
    });
  }, []);
  return null;
}
