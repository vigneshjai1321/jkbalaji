'use client';

import { Building2, Gem, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { useAdminWorkspace } from './AdminWorkspaceContext';
import { WORKSPACE_LABELS, type AdminWorkspace } from '@/lib/admin-workspace';
import { useAdminTheme } from './AdminShell';

const OPTIONS: { key: AdminWorkspace; icon: typeof LayoutGrid; accent: string }[] = [
  { key: 'all', icon: LayoutGrid, accent: 'text-blue-400' },
  { key: 'real_estate', icon: Building2, accent: 'text-blue-400' },
  { key: 'jewellery', icon: Gem, accent: 'text-amber-400' },
];

export function WorkspaceSelector({ compact }: { compact?: boolean }) {
  const { workspace, setWorkspace } = useAdminWorkspace();
  const dark = useAdminTheme() === 'dark';

  return (
    <div className={clsx('flex flex-col gap-1', compact ? 'min-w-0' : '')}>
      {!compact ? (
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Workspace</span>
      ) : null}
      <div
        className={clsx(
          'flex rounded-xl border p-0.5 gap-0.5',
          dark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100',
          compact ? 'flex-wrap' : 'flex-col sm:flex-row',
        )}
        role="group"
        aria-label="Business workspace"
      >
        {OPTIONS.map(({ key, icon: Icon, accent }) => {
          const active = workspace === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setWorkspace(key)}
              className={clsx(
                'flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors min-w-0',
                active
                  ? dark
                    ? 'bg-blue-600/30 text-white ring-1 ring-blue-500/40'
                    : 'bg-white text-slate-900 shadow-sm ring-1 ring-blue-200'
                  : dark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    : 'text-slate-600 hover:bg-white/80',
              )}
              aria-pressed={active}
            >
              <Icon size={16} className={clsx('shrink-0', active ? accent : 'opacity-70')} />
              <span className="truncate">{WORKSPACE_LABELS[key]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
