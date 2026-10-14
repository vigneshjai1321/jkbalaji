'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Site = 'realestate' | 'jewellery';

const links: Record<Site, { href: string; label: string }[]> = {
  realestate: [
    { href: '#about', label: 'About' },
    { href: '#why', label: 'Why Us' },
    { href: '#properties', label: 'Properties' },
    { href: '#coverage', label: 'Coverage' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#faq', label: 'FAQ' },
  ],
  jewellery: [
    { href: '#about', label: 'About' },
    { href: '#collections', label: 'Collections' },
    { href: '#schemes', label: 'Schemes' },
    { href: '#rates', label: 'Gold Rate' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#faq', label: 'FAQ' },
  ],
};

export function SiteNavbar({ site }: { site: Site }) {
  const [scrolled, setScrolled] = useState(false);
  const base = site === 'realestate' ? '/realestate' : '/jewellery';
  const brand = site === 'realestate' ? 'JK Balaji' : 'Cheyyar Balaji';
  const accent = site === 'realestate' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-amber-700 hover:bg-amber-800';
  const brandColor = site === 'realestate' ? 'text-emerald-900' : 'text-amber-900';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-md backdrop-blur-md' : 'bg-white/70 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href={base} className={`font-bold text-lg ${brandColor}`}>
          {brand}
        </Link>
        <nav className="hidden lg:flex gap-5 items-center text-sm text-slate-700">
          {links[site].map((l) => (
            <Link key={l.href} href={`${base}${l.href}`} className="hover:opacity-70 transition-opacity">
              {l.label}
            </Link>
          ))}
          <Link href={`${base}#contact`} className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${accent}`}>
            Enquire
          </Link>
        </nav>
        <Link href={`${base}#contact`} className={`lg:hidden px-3 py-2 rounded-lg text-white text-sm ${accent}`}>
          Contact
        </Link>
      </div>
    </header>
  );
}
