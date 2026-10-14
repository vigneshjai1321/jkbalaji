'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { JW_COLLECTIONS_DROPDOWN, JW_NAV_PRIMARY, JW_ROUTES } from '@/lib/site-routes';
import { SRI_BALAJI } from '@/lib/jewellery-business';

function isActive(pathname: string, href: string) {
  if (href === JW_ROUTES.home) return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function collectionsActive(pathname: string) {
  return (
    pathname.startsWith('/collections') ||
    pathname.startsWith('/gold-schemes') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/gallery') ||
    pathname.startsWith('/visit') ||
    pathname.startsWith('/faq')
  );
}

export function JewelleryNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrop, setMobileDrop] = useState(false);
  const menuId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setMobileDrop(false);
  }, []);

  useEffect(() => {
    closeMenu();
    setDropdownOpen(false);
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        closeMenu();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  const navActive = (href: string, dropdown?: boolean) =>
    dropdown ? collectionsActive(pathname) : isActive(pathname, href);

  return (
    <>
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b',
          scrolled ? 'bg-[#faf8f4]/95 shadow-sm backdrop-blur-md border-stone-200/80' : 'bg-[#faf8f4]/90 backdrop-blur-sm border-transparent',
        )}
      >
        <div className="jw-container flex h-[4.25rem] items-center justify-between gap-3">
          <Link href={JW_ROUTES.home} className="flex items-center gap-2 min-w-0" onClick={closeMenu}>
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #9a7209, #d4af37)' }}
              aria-hidden
            >
              SB
            </span>
            <span className="min-w-0 hidden sm:block">
              <span className="block truncate text-sm font-bold text-stone-900 leading-tight">{SRI_BALAJI.name}</span>
              <span className="block truncate text-[10px] text-stone-500 tracking-wide">Cheyyar</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
            {JW_NAV_PRIMARY.map((item) =>
              item.dropdown ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button
                    type="button"
                    className="jw-nav-link inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                    data-active={navActive(item.href, true) ? 'true' : 'false'}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    onClick={() => setDropdownOpen((v) => !v)}
                  >
                    {item.label}
                    <ChevronDown className={clsx('h-4 w-4', dropdownOpen && 'rotate-180')} />
                  </button>
                  {dropdownOpen ? (
                    <div className="absolute left-0 top-full pt-2 min-w-[15rem]">
                      <ul className="rounded-xl border border-stone-200 bg-white py-2 shadow-lg" role="menu">
                        {JW_COLLECTIONS_DROPDOWN.map((link) => (
                          <li key={link.href} role="none">
                            <Link href={link.href} role="menuitem" className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-amber-50 hover:text-amber-950">
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link key={item.href} href={item.href} className="jw-nav-link" data-active={navActive(item.href) ? 'true' : 'false'}>
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden lg:flex shrink-0">
            <a href={JW_ROUTES.visit} className="jw-btn-gold">
              Visit Showroom
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-lg border border-stone-200 text-stone-800"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" className="absolute inset-0 bg-stone-900/40" aria-label="Close menu overlay" onClick={closeMenu} />
          <aside
            id={menuId}
            className="absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col bg-[#faf8f4] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex h-[4.25rem] items-center justify-between border-b border-stone-200 px-5">
              <span className="font-bold text-stone-900">Menu</span>
              <button ref={closeRef} type="button" className="p-2 rounded-lg bg-stone-100" aria-label="Close menu" onClick={closeMenu}>
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-6" aria-label="Mobile">
              <ul className="space-y-1">
                {JW_NAV_PRIMARY.map((item) =>
                  item.dropdown ? (
                    <li key={item.label}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-3 text-lg font-medium text-stone-800"
                        aria-expanded={mobileDrop}
                        onClick={() => setMobileDrop((v) => !v)}
                      >
                        {item.label}
                        <ChevronDown className={clsx('h-5 w-5', mobileDrop && 'rotate-180')} />
                      </button>
                      {mobileDrop ? (
                        <ul className="ml-2 border-l border-stone-200 pl-3 space-y-1">
                          {JW_COLLECTIONS_DROPDOWN.map((link) => (
                            <li key={link.href}>
                              <Link href={link.href} onClick={closeMenu} className="block py-2 text-base text-stone-700">
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ) : (
                    <li key={item.href}>
                      <Link href={item.href} onClick={closeMenu} className="block py-3 text-lg font-medium text-stone-800 border-b border-stone-100">
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
              <a href={JW_ROUTES.visit} onClick={closeMenu} className="jw-btn-gold w-full mt-8 text-center">
                Visit Showroom
              </a>
            </nav>
          </aside>
        </div>
      ) : null}
      <div className="h-[4.25rem]" aria-hidden />
    </>
  );
}
