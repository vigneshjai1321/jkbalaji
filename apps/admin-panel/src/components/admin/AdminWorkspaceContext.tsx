'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { type AdminWorkspace, workspaceStorageKey } from '@/lib/admin-workspace';

type Ctx = {
  workspace: AdminWorkspace;
  setWorkspace: (w: AdminWorkspace) => void;
};

const AdminWorkspaceContext = createContext<Ctx | null>(null);

export function AdminWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspaceState] = useState<AdminWorkspace>('all');

  useEffect(() => {
    const stored = localStorage.getItem(workspaceStorageKey()) as AdminWorkspace | null;
    if (stored === 'all' || stored === 'real_estate' || stored === 'jewellery') {
      setWorkspaceState(stored);
    }
  }, []);

  const setWorkspace = (w: AdminWorkspace) => {
    setWorkspaceState(w);
    localStorage.setItem(workspaceStorageKey(), w);
  };

  const value = useMemo(() => ({ workspace, setWorkspace }), [workspace]);

  return <AdminWorkspaceContext.Provider value={value}>{children}</AdminWorkspaceContext.Provider>;
}

export function useAdminWorkspace() {
  const ctx = useContext(AdminWorkspaceContext);
  if (!ctx) throw new Error('useAdminWorkspace must be used within AdminWorkspaceProvider');
  return ctx;
}
