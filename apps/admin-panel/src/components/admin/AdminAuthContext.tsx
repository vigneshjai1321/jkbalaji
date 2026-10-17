'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ADMIN_TAB_UNLOCK_REQUIRED_EVENT, ADMIN_UNAUTHORIZED_EVENT } from '../../lib/admin-auth-events';
import { adminFetch, adminLogin, adminVerifyTab } from '../../lib/admin-api';
import { clearTabSession, hasTabSession } from '../../lib/admin-tab-session';

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string | null;
  phone?: string | null;
  lastLoginAt?: string | null;
};

type Ctx = {
  ready: boolean;
  token: string | null;
  user: AdminUser | null;
  tabUnlocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyTab: (password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<Ctx | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [tabUnlocked, setTabUnlocked] = useState(false);

  useEffect(() => {
    const onTabLock = () => setTabUnlocked(false);
    setTabUnlocked(hasTabSession());
    window.addEventListener(ADMIN_TAB_UNLOCK_REQUIRED_EVENT, onTabLock);
    return () => window.removeEventListener(ADMIN_TAB_UNLOCK_REQUIRED_EVENT, onTabLock);
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      localStorage.removeItem('jk_token');
      localStorage.removeItem('jk_user');
      clearTabSession();
      setToken(null);
      setUser(null);
      setTabUnlocked(false);
    };
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'jk_token' && !e.newValue) {
        clearTabSession();
        setToken(null);
        setUser(null);
        setTabUnlocked(false);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const t = localStorage.getItem('jk_token');
      if (!t) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const me = await adminFetch<AdminUser>('/auth/me');
        if (!cancelled) {
          setToken(t);
          setUser(me);
          setTabUnlocked(hasTabSession());
          localStorage.setItem('jk_user', JSON.stringify(me));
        }
      } catch {
        localStorage.removeItem('jk_token');
        localStorage.removeItem('jk_user');
        if (!cancelled) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await adminLogin(email, password);
    localStorage.setItem('jk_token', res.accessToken);
    localStorage.setItem('jk_user', JSON.stringify(res.user));
    setToken(res.accessToken);
    setUser(res.user);
    await adminVerifyTab(password, res.accessToken);
    setTabUnlocked(true);
  }, []);

  const verifyTab = useCallback(async (password: string) => {
    await adminVerifyTab(password);
    setTabUnlocked(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await adminFetch('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    localStorage.removeItem('jk_token');
    localStorage.removeItem('jk_user');
    clearTabSession();
    setToken(null);
    setUser(null);
    setTabUnlocked(false);
  }, [token]);

  const value = useMemo(
    () => ({ ready, token, user, tabUnlocked, login, verifyTab, logout }),
    [ready, token, user, tabUnlocked, login, verifyTab, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
