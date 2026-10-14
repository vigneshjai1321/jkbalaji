'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { createContext, useContext, useEffect, useRef, useState, type RefObject } from 'react';
import { clsx } from 'clsx';
import { NAV_GROUPS, navItemIsActive } from './admin-nav';
import { filterNavGroupsForRole } from '@/lib/admin-nav-access';
import { BusinessPathSync, useBusiness } from './BusinessContext';
import { AdminTopBar } from './AdminTopBar';
import { AdminBreadcrumbs } from './AdminBreadcrumbs';

export const AdminThemeContext = createContext<'dark' | 'light'>('light');
export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

function NavFlyout({ label, hint, dark }: { label: string; hint?: string; dark: boolean }) {
  return (
    <div className={clsx('admin-nav-flyout', dark ? 'admin-nav-flyout--dark' : 'admin-nav-flyout--light')} role="tooltip">
      <p className="font-semibold">{label}</p>
      {hint ? <p className="admin-nav-flyout-hint mt-0.5 text-xs leading-snug">{hint}</p> : null}
    </div>
  );
}

export function AdminShell({
  children,
  theme,
  onToggleTheme,
  onLogout,
  user,
}: {
  children: React.ReactNode;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void | Promise<void>;
  user: { name: string; role: string; email: string };
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const dark = theme === 'dark';
  const { business } = useBusiness();
  const visibleGroups = filterNavGroupsForRole(
    NAV_GROUPS.filter((group) => {
      if (business === 'real-estate') return group.title !== 'Jewellery';
      if (business === 'jewellery') return group.title !== 'Real Estate';
      return true;
    }),
    user.role,
  );
  const businessLabel = business === 'real-estate' ? 'Real Estate' : business === 'jewellery' ? 'Gold & Jewellery' : 'All businesses';

  useEffect(() => {
    const stored = localStorage.getItem('jk_admin_sidebar_collapsed');
    if (stored === '1') setCollapsed(true);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  /** Scroll page content only — never the document (avoids sidebar jumping with Next.js navigation). */
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname, search]);

  /** When business filter hides nav groups, clamping scrollTop can jerk the sidebar — reset once per filter change. */
  useEffect(() => {
    sidebarScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [business]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem('jk_admin_sidebar_collapsed', next ? '1' : '0');
      return next;
    });
  };

  const shell = dark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900';
  const sidebar = dark ? 'bg-[#0f172a] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm';
  const linkIdle = dark ? 'text-slate-400 hover:bg-white/10 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
  const linkActive = dark ? 'bg-blue-600/25 text-blue-100 ring-1 ring-blue-500/40' : 'bg-blue-50 text-blue-900 ring-1 ring-blue-200';
  const linkActiveJewellery = dark ? 'bg-amber-600/20 text-amber-100 ring-1 ring-amber-500/35' : 'bg-amber-50 text-amber-950 ring-1 ring-amber-200';

  const SidebarContent = ({
    forceExpanded,
    scrollRef,
  }: {
    forceExpanded?: boolean;
    scrollRef?: RefObject<HTMLDivElement | null>;
  }) => {
    const narrow = !forceExpanded && collapsed;
    return (
      <>
        <div className={clsx('flex items-center border-b border-inherit shrink-0', narrow ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5')}>
          <div className="h-9 w-9 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-bold">JK</div>
          {!narrow ? (
            <div className="min-w-0">
              <p className={clsx('font-semibold text-sm truncate', dark ? 'text-white' : 'text-slate-900')}>JK Balaji ERP</p>
              <p className="text-xs truncate text-slate-500">{businessLabel}</p>
            </div>
          ) : null}
        </div>
        <div
          ref={scrollRef}
          className="admin-sidebar-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4"
        >
          {visibleGroups.map((group) => (
            <div key={group.title}>
              {!narrow ? (
                <p
                  className={clsx(
                    'px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider',
                    group.title === 'Jewellery' ? 'text-amber-700' : dark ? 'text-slate-500' : 'text-slate-500',
                  )}
                >
                  {group.title}
                </p>
              ) : (
                <div className={clsx('mx-auto mb-2 h-px w-6', dark ? 'bg-white/10' : 'bg-slate-200')} />
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = navItemIsActive(pathname, search, item.href, item.exact);
                  const jewelleryNav = item.jewelleryAccent;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      scroll={false}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        'admin-nav-link relative flex items-center rounded-lg transition-colors',
                        narrow ? 'justify-center p-2.5' : 'gap-3 px-2.5 py-2 text-sm font-medium',
                        active ? (jewelleryNav ? linkActiveJewellery : linkActive) : linkIdle,
                      )}
                    >
                      <Icon size={20} strokeWidth={1.75} className="shrink-0 opacity-90" aria-hidden />
                      {!narrow ? <span className="truncate leading-snug">{item.label}</span> : null}
                      {narrow ? <NavFlyout label={item.label} hint={item.hint} dark={dark} /> : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
        <div className="border-t border-inherit p-2 space-y-0.5 shrink-0">
          {!forceExpanded ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className={clsx(
                'hidden lg:flex w-full items-center rounded-lg py-2 text-sm',
                collapsed ? 'justify-center' : 'gap-2 px-2.5',
                linkIdle,
              )}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              {!collapsed ? <span>Collapse</span> : null}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className={clsx(
              'flex w-full items-center rounded-lg py-2 text-sm lg:hidden',
              collapsed && !forceExpanded ? 'justify-center px-2' : 'gap-2 px-2.5',
              linkIdle,
            )}
          >
            <LogOut size={18} />
            {(!collapsed || forceExpanded) && <span>Sign out</span>}
          </button>
        </div>
      </>
    );
  };

  const sidebarWidth = collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64';

  return (
    <div className={clsx('admin-app fixed inset-0 flex overflow-hidden', shell)} data-admin-theme={theme}>
      <aside
        className={clsx(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 h-full max-h-[100dvh] border-r transition-[width] duration-200 shrink-0',
          sidebar,
          collapsed ? 'admin-sidebar--collapsed w-[4.5rem]' : 'w-64',
        )}
      >
        <SidebarContent scrollRef={sidebarScrollRef} />
      </aside>

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex h-full max-h-[100dvh] w-[min(100%,18rem)] flex-col border-r lg:hidden transition-transform duration-200',
          sidebar,
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <SidebarContent forceExpanded />
      </aside>

      {mobileOpen ? (
        <button type="button" className="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
      ) : null}

      <div className={clsx('flex flex-1 flex-col min-w-0 min-h-0 h-full w-full', sidebarWidth)}>
        <BusinessPathSync />
        <AdminTopBar
          theme={theme}
          user={user}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
          mobileOpen={mobileOpen}
          onMobileMenu={() => setMobileOpen((o) => !o)}
          sidebarCollapsed={collapsed}
          onToggleSidebar={toggleCollapsed}
        />
        <main
          ref={mainRef}
          className={clsx(
            'flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 md:p-6 lg:p-8 text-[15px] leading-relaxed',
            dark ? 'bg-slate-950' : 'bg-slate-100',
          )}
        >
          <AdminThemeContext.Provider value={theme}>
            <div className="mb-4 min-h-[1.75rem]">
              <AdminBreadcrumbs />
            </div>
            {children}
          </AdminThemeContext.Provider>
        </main>
      </div>
    </div>
  );
}
