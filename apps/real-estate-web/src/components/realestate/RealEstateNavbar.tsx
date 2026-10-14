'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { RE_NAV_PRIMARY, RE_PROJECTS_DROPDOWN, RE_ROUTES } from '@/lib/site-routes';

function isActive(pathname: string, href: string) {
  if (href === RE_ROUTES.home) return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function projectsActive(pathname: string) {
  return (
    pathname.startsWith('/projects') ||
    pathname.startsWith('/jk-nagar') ||
    pathname.startsWith('/properties')
  );
}

export function RealEstateNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [mobileProjectsOpen, setMobileProjectsOpen] = useState(false);
  const menuId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setMobileProjectsOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      closeBtnRef.current?.focus();
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  useEffect(() => {
    closeMenu();
    setProjectsOpen(false);
  }, [pathname, closeMenu]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProjectsOpen(false);
        closeMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  const linkClass = (href: string, dropdown?: boolean) =>
    clsx(
      'relative py-2 text-[15px] font-medium tracking-tight transition-colors rounded-lg px-1',
      (dropdown ? projectsActive(pathname) : isActive(pathname, href))
        ? 'text-emerald-800 after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-emerald-600'
        : 'text-slate-700 hover:text-emerald-800',
    );

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          scrolled ? 'bg-white/[0.98] border-slate-200/80 shadow-sm' : 'bg-white/95 border-transparent',
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={RE_ROUTES.home} className="flex shrink-0 items-center gap-2.5 group" onClick={closeMenu}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white shadow-md shadow-emerald-900/20 group-hover:bg-emerald-900 transition-colors">
              JK
            </span>
            <span className="hidden sm:block leading-tight">
              <span className="block text-base font-bold tracking-tight text-slate-900">JK Balaji</span>
              <span className="block text-[11px] font-medium tracking-wide text-emerald-700">Real Estate</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 xl:gap-8" aria-label="Primary">
            {RE_NAV_PRIMARY.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setProjectsOpen(true)}
                  onMouseLeave={() => setProjectsOpen(false)}
                >
                  <button
                    type="button"
                    className={clsx(linkClass(item.href, true), 'inline-flex items-center gap-1')}
                    aria-expanded={projectsOpen}
                    aria-haspopup="true"
                    onClick={() => setProjectsOpen((o) => !o)}
                  >
                    {item.label}
                    <ChevronDown className={clsx('h-4 w-4 transition-transform', projectsOpen && 'rotate-180')} aria-hidden />
                  </button>
                  {projectsOpen ? (
                    <div className="absolute left-0 top-full pt-2 min-w-[14rem]">
                      <ul className="rounded-xl border border-slate-200 bg-white py-2 shadow-lg shadow-slate-200/60" role="menu">
                        {RE_PROJECTS_DROPDOWN.map((link) => (
                          <li key={link.href} role="none">
                            <Link
                              href={link.href}
                              role="menuitem"
                              className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={RE_ROUTES.contact}
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/15 hover:bg-emerald-900 transition-all"
            >
              Enquire Now
            </Link>
            <button
              type="button"
              className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {!menuOpen ? null : (
        <div className="fixed inset-0 z-[60] lg:hidden" role="presentation">
          <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Close menu overlay" onClick={closeMenu} />
          <aside
            id={menuId}
            className="absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex h-[4.25rem] items-center justify-between border-b border-slate-100 px-5">
              <span className="font-bold text-slate-900">Menu</span>
              <button
                ref={closeBtnRef}
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
                {RE_NAV_PRIMARY.map((item) =>
                  item.dropdown ? (
                    <li key={item.label}>
                      <button
                        type="button"
                        className="flex w-full min-h-[3rem] items-center justify-between rounded-xl px-4 text-lg font-medium text-slate-800 hover:bg-slate-50"
                        aria-expanded={mobileProjectsOpen}
                        onClick={() => setMobileProjectsOpen((o) => !o)}
                      >
                        {item.label}
                        <ChevronDown className={clsx('h-5 w-5', mobileProjectsOpen && 'rotate-180')} />
                      </button>
                      {mobileProjectsOpen ? (
                        <ul className="ml-2 mt-1 space-y-1 border-l border-slate-200 pl-3">
                          {RE_PROJECTS_DROPDOWN.map((link) => (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                onClick={closeMenu}
                                className="block py-2.5 text-base text-slate-700 hover:text-emerald-800"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className={clsx(
                          'flex min-h-[3rem] items-center rounded-xl px-4 text-lg font-medium transition-colors',
                          isActive(pathname, item.href) ? 'bg-emerald-50 text-emerald-900' : 'text-slate-800 hover:bg-slate-50',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
              <Link
                href={RE_ROUTES.contact}
                onClick={closeMenu}
                className="mt-8 flex min-h-[3.25rem] items-center justify-center rounded-xl bg-emerald-800 text-base font-semibold text-white"
              >
                Enquire Now
              </Link>
            </nav>
          </aside>
        </div>
      )}
      <div className="h-[4.25rem]" aria-hidden />
    </>
  );
}
