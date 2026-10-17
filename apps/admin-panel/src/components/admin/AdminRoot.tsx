'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminTabUnlock } from './AdminTabUnlock';
import { AdminShell } from './AdminShell';
import { BusinessProvider } from './BusinessContext';
import { AdminScopeGuard } from './AdminScopeGuard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function AdminGate({ children }: { children: React.ReactNode }) {
  const { ready, token, user, tabUnlocked, logout } = useAdminAuth();
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    typeof window !== 'undefined' ? ((localStorage.getItem('jk_admin_theme') as 'dark' | 'light') ?? 'light') : 'light',
  );

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-pulse text-sm">Loading workspace…</div>
      </div>
    );
  }

  if (!token || !user) {
    return <AdminLogin theme={theme} />;
  }

  if (!tabUnlocked) {
    return <AdminTabUnlock theme={theme} />;
  }

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('jk_admin_theme', next);
      return next;
    });
  };

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500 text-sm">Loading…</div>}>
      <BusinessProvider>
        <AdminShell theme={theme} onToggleTheme={toggleTheme} onLogout={logout} user={user}>
          <AdminScopeGuard role={user.role}>{children}</AdminScopeGuard>
        </AdminShell>
      </BusinessProvider>
    </Suspense>
  );
}

export function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <AdminGate>{children}</AdminGate>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
