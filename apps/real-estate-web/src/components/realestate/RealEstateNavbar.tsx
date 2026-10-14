'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const BASE = '/';

const NAV = [
  { href: '/jk-nagar', label: 'JK Nagar', route: true as const },
  { href: '#properties', label: 'Properties' },
  { href: '#projects', label: 'Projects' },
  { href: '#about', label: 'About' },
  { href: '#why', label: 'Why Us' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
] as const;

const SECTION_IDS = [...NAV.filter((n) => n.href.startsWith('#')).map((n) => n.href.slice(1)), 'projects', 'coverage', 'gallery'];

export function RealEstateNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.25, 0.5] },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      return () => {
        document.body.style.overflow = prev;
        document.body.style.touchAction = '';
      };
    }
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  const linkClass = (hash: string) =>
    clsx(
      'relative py-2 text-[15px] font-medium tracking-tight transition-colors',
      active === hash.slice(1)
        ? 'text-emerald-800 after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-emerald-600'
        : 'text-slate-700 hover:text-emerald-800',
    );

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          scrolled
            ? 'bg-white/[0.98] border-slate-200/80 shadow-sm'
            : 'bg-white/90 border-transparent',
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link href={BASE} className="flex shrink-0 items-center gap-2.5 group" onClick={closeMenu}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white shadow-md shadow-emerald-900/20 group-hover:bg-emerald-900 transition-colors">
              JK
            </span>
            <span className="hidden sm:block leading-tight">
              <span className="block text-base font-bold tracking-tight text-slate-900">JK Balaji</span>
              <span className="block text-[11px] font-medium tracking-wide text-emerald-700">Real Estate</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={'route' in item && item.route ? item.href : `${BASE}${item.href}`}
                className={'route' in item && item.route ? linkClass('') : linkClass(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={`${BASE}#contact`}
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 hover:bg-emerald-900 hover:shadow-lg transition-all"
            >
              Enquire Now
            </Link>
            <button
              type="button"
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 transition-colors"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={clsx(
          'fixed inset-0 z-[60] lg:hidden transition-opacity duration-300',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/50"
          aria-label="Close menu overlay"
          onClick={closeMenu}
        />
        <aside
          className={clsx(
            'absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out',
            menuOpen ? 'translate-x-0' : 'translate-x-full',
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex h-[4.25rem] items-center justify-between border-b border-slate-100 px-5">
            <span className="font-bold text-slate-900">Menu</span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-800"
              aria-label="Close menu"
              onClick={closeMenu}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto overscroll-contain px-5 py-6" aria-label="Mobile">
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={'route' in item && item.route ? item.href : `${BASE}${item.href}`}
                    onClick={closeMenu}
                    className={clsx(
                      'flex min-h-[3rem] items-center rounded-xl px-4 text-lg font-medium transition-colors',
                      !('route' in item && item.route) && active === item.href.slice(1)
                        ? 'bg-emerald-50 text-emerald-900'
                        : 'text-slate-800 hover:bg-slate-50',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`${BASE}#contact`}
              onClick={closeMenu}
              className="mt-8 flex min-h-[3.25rem] items-center justify-center rounded-xl bg-emerald-800 text-base font-semibold text-white"
            >
              Enquire Now
            </Link>
          </nav>
        </aside>
      </div>
      <div className="h-[4.25rem]" aria-hidden />
    </>
  );
}
