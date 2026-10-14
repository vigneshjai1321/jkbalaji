'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Bell, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Plus, Receipt, Search, Sun, User, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';
import { adminFetch } from '../../lib/admin-api';
import { NAV_GROUPS } from './admin-nav';
import { BusinessSelector } from './BusinessSelector';
import { useBusiness } from './BusinessContext';
import { useAdminAuth } from './AdminAuthContext';

type Notification = { id: string; title: string; body: string; readAt: string | null; createdAt: string };

const PAGE_TITLES: Record<string, string> = {
  '': 'Overview',
  leads: 'Leads',
  crm: 'CRM',
  realestate: 'Properties',
  projects: 'Projects',
  plots: 'Plots',
  jewellery: 'Jewellery',
  'gold-rates': 'Gold rates',
  billing: 'Gold billing',
  customers: 'Customers',
  users: 'Users & roles',
  profile: 'Profile & security',
  settings: 'Settings',
};

export function AdminTopBar({
  theme,
  user,
  onToggleTheme,
  onLogout,
  onMobileMenu,
  mobileOpen,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  theme: 'dark' | 'light';
  user: { name: string; role: string; email: string };
  onToggleTheme: () => void;
  onLogout: () => void | Promise<void>;
  onMobileMenu: () => void;
  mobileOpen: boolean;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}) {
  const dark = theme === 'dark';
  const pathname = usePathname();
  const { business } = useBusiness();
  const { token, ready: authReady } = useAdminAuth();
  const navGroupsForBusiness = useMemo(() => {
    return NAV_GROUPS.filter((group) => {
      if (business === 'real-estate') return group.title !== 'Jewellery';
      if (business === 'jewellery') return group.title !== 'Real Estate';
      return true;
    });
  }, [business]);
  const [search, setSearch] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openProfile = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
    setShowProfile(true);
  };

  const scheduleCloseProfile = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
    profileCloseTimer.current = setTimeout(() => setShowProfile(false), 160);
  };

  const cancelCloseProfile = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
  };

  useEffect(() => {
    setShowProfile(false);
  }, [pathname]);

  useEffect(() => {
    if (!showProfile) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowProfile(false);
    };
    const onPointer = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setShowProfile(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [showProfile]);

  useEffect(
    () => () => {
      if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current);
    },
    [],
  );

  const pageSeg = pathname.split('/').filter(Boolean)[0] ?? '';
  const pageTitle = PAGE_TITLES[pageSeg] ?? (pageSeg ? pageSeg.replace(/-/g, ' ') : 'Overview');

  const notifications = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminFetch<Notification[]>('/notifications'),
    retry: false,
    enabled: authReady && !!token,
  });

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return navGroupsForBusiness
      .flatMap((g) => g.items)
      .filter((i) => i.label.toLowerCase().includes(q) || (i.hint ?? '').toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, navGroupsForBusiness]);

  const shellBtn = clsx(
    'inline-flex items-center justify-center h-9 w-9 rounded-lg border transition-colors',
    dark ? 'border-white/10 hover:bg-white/5 text-slate-200' : 'border-slate-200/80 hover:bg-slate-50 text-slate-700',
  );

  return (
    <header
      className={clsx(
        'admin-header-bar shrink-0 z-30 flex items-center gap-2 sm:gap-3 border-b px-3 sm:px-5 h-14',
        dark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200',
      )}
    >
      <button type="button" className={clsx(shellBtn, 'lg:hidden shrink-0')} onClick={onMobileMenu} aria-label="Menu">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {onToggleSidebar ? (
        <button
          type="button"
          className={clsx(shellBtn, 'hidden lg:inline-flex shrink-0')}
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      ) : null}

      <div className="hidden sm:block min-w-0 mr-1">
        <p className={clsx('text-base font-semibold truncate leading-tight', dark ? 'text-white' : 'text-slate-900')}>{pageTitle}</p>
        <p className={clsx('text-xs truncate', dark ? 'text-slate-500' : 'text-slate-500')}>JK Balaji Admin</p>
      </div>

      <BusinessSelector />

      <div className="relative flex-1 max-w-lg min-w-0 ml-auto sm:ml-0">
        <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? 'text-slate-500' : 'text-slate-400'}`} aria-hidden />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search modules…"
          className={clsx(
            'w-full h-9 rounded-lg border pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/25',
            dark ? 'bg-slate-900/80 border-white/10 placeholder:text-slate-500 text-slate-100' : 'bg-slate-50/80 border-slate-200 text-slate-900',
          )}
        />
        {searchHits.length ? (
          <ul
            className={clsx(
              'absolute left-0 right-0 top-full mt-1 rounded-lg border shadow-lg overflow-hidden z-[60]',
              dark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
            )}
          >
            {searchHits.map((h) => (
              <li key={h.href}>
                <Link
                  href={h.href}
                  className={clsx('block px-4 py-2.5 text-sm hover:bg-blue-50', dark ? 'text-slate-200 hover:bg-white/5' : 'text-slate-800')}
                  onClick={() => setSearch('')}
                >
                  {h.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="relative hidden md:block shrink-0">
        <button type="button" className={shellBtn} onClick={() => setShowQuick((v) => !v)} aria-label="Quick actions">
          <Plus size={20} />
        </button>
        {showQuick ? (
          <div
            className={clsx(
              'absolute right-0 top-full mt-2 w-52 rounded-lg border shadow-lg py-1 z-[60]',
              dark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
            )}
          >
            {(business === 'all' || business === 'jewellery') && (
              <Link href="/billing" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => setShowQuick(false)}>
                <Receipt size={18} /> New invoice
              </Link>
            )}
            <Link href="/crm" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => setShowQuick(false)}>
              CRM
            </Link>
            <Link
              href={business === 'jewellery' ? '/leads?site=JEWELLERY' : business === 'real-estate' ? '/leads?site=REAL_ESTATE' : '/leads'}
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"
              onClick={() => setShowQuick(false)}
            >
              Leads
            </Link>
            {(business === 'all' || business === 'real-estate') && (
              <Link href="/plots/new" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => setShowQuick(false)}>
                Add plot
              </Link>
            )}
          </div>
        ) : null}
      </div>

      <div className="relative shrink-0">
        <button type="button" className={shellBtn} onClick={() => setShowNotif((v) => !v)} aria-label="Notifications">
          <Bell size={20} />
        </button>
        {showNotif ? (
          <div
            className={clsx(
              'absolute right-0 top-full mt-2 w-80 max-h-96 overflow-auto rounded-lg border shadow-lg z-[60]',
              dark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
            )}
          >
            <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-blue-600">Notifications</p>
            {(notifications.data ?? []).map((n) => (
              <div key={n.id} className={clsx('px-4 py-3 border-t text-sm', dark ? 'border-white/5' : 'border-slate-100')}>
                <p className="font-medium">{n.title}</p>
                <p className={`text-xs mt-1 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{n.body}</p>
              </div>
            ))}
            {notifications.isError || !notifications.data?.length ? (
              <p className="px-4 py-6 text-sm text-slate-500">No notifications</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <button type="button" onClick={onToggleTheme} className={shellBtn} aria-label="Toggle theme">
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div
        ref={profileRef}
        className="relative shrink-0"
        onMouseEnter={cancelCloseProfile}
        onMouseLeave={scheduleCloseProfile}
      >
        <button
          type="button"
          aria-expanded={showProfile}
          aria-haspopup="menu"
          className={clsx(
            'flex items-center gap-2 h-9 rounded-lg border pl-1.5 pr-2.5 max-w-[12rem] transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/40 outline-none',
            dark ? 'border-white/10 hover:bg-white/5' : 'border-slate-200/80 hover:bg-slate-50',
          )}
          onClick={() => (showProfile ? setShowProfile(false) : openProfile())}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold shrink-0">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden md:inline text-sm font-medium truncate">{user.name}</span>
        </button>
        {showProfile ? (
          <div
            className="absolute right-0 top-full z-[80] w-[min(100vw-1rem,14rem)] pt-1 sm:w-56"
            role="menu"
            onMouseEnter={cancelCloseProfile}
          >
            <div
              className={clsx(
                'rounded-lg border shadow-lg py-2 max-h-[min(70vh,20rem)] overflow-auto',
                dark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200',
              )}
            >
              <p className="px-4 py-2 text-sm font-semibold truncate">{user.name}</p>
              <p className="px-4 text-xs text-slate-500 truncate">{user.email}</p>
              <Link
                href="/profile"
                role="menuitem"
                className={clsx(
                  'mt-2 flex w-full items-center gap-2 px-4 py-2.5 text-sm',
                  dark ? 'hover:bg-white/5' : 'hover:bg-slate-50',
                )}
                onClick={() => setShowProfile(false)}
              >
                <User size={18} /> Profile &amp; security
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => void onLogout()}
                className={clsx(
                  'flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600',
                  dark ? 'hover:bg-red-500/10' : 'hover:bg-red-50',
                )}
              >
                <LogOut size={18} /> Sign out
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
