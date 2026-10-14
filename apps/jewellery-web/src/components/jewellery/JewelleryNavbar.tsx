'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { SRI_BALAJI } from '@/lib/jewellery-business';

const NAV = [
  { href: '/#home', label: 'Home', id: 'home' },
  { href: '/#collections', label: 'Collections', id: 'collections' },
  { href: '/#schemes', label: 'Gold Scheme', id: 'schemes' },
  { href: '/#services', label: 'Services', id: 'services' },
  { href: '/#about', label: 'About', id: 'about' },
  { href: '/#contact', label: 'Contact', id: 'contact' },
] as const;

export function JewelleryNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const ids = NAV.map((n) => n.id);
      for (let i = ids.length - 1; i >= 0; i -= 1) {
        const el = document.getElementById(ids[i]!);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(ids[i]!);
          break;
        }
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#faf8f4]/95 shadow-sm backdrop-blur-md border-b border-stone-200/80' : 'bg-[#faf8f4]/90 backdrop-blur-sm'
      }`}
    >
      <div className="jw-container flex h-[4.25rem] items-center justify-between gap-3">
        <Link href="/#home" className="flex items-center gap-2 min-w-0" onClick={() => setOpen(false)}>
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #9a7209, #d4af37)' }}
            aria-hidden
          >
            SB
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-stone-900 leading-tight">{SRI_BALAJI.name}</span>
            <span className="block truncate text-[10px] text-stone-500 tracking-wide">Cheyyar</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="jw-nav-link"
              data-active={active === item.id ? 'true' : 'false'}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <a href={`tel:${SRI_BALAJI.phoneE164}`} className="jw-btn-outline">
            <Phone size={16} aria-hidden /> Call Now
          </a>
          <a href={SRI_BALAJI.schemeTel} className="jw-btn-gold">
            Gold Scheme Enquiry
          </a>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 rounded-lg border border-stone-200 text-stone-800"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={`lg:hidden fixed inset-0 top-[4.25rem] z-40 bg-stone-900/40 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />
      <nav
        className={`lg:hidden fixed inset-x-0 top-[4.25rem] z-50 bg-[#faf8f4] border-b border-stone-200 shadow-lg transition-transform duration-300 ${
          open ? 'translate-y-0' : '-translate-y-full pointer-events-none'
        }`}
        aria-label="Mobile"
      >
        <ul className="jw-container py-4 space-y-1">
          {NAV.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="block py-3 text-base font-medium text-stone-800 border-b border-stone-100"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-4 flex flex-col gap-2">
            <a href={`tel:${SRI_BALAJI.phoneE164}`} className="jw-btn-outline w-full" onClick={() => setOpen(false)}>
              Call Now
            </a>
            <a href={SRI_BALAJI.schemeTel} className="jw-btn-gold w-full" onClick={() => setOpen(false)}>
              Gold Scheme Enquiry
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
