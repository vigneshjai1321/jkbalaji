import { clsx } from 'clsx';
import type { LucideIcon } from 'lucide-react';

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  theme,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: 'emerald' | 'amber' | 'blue' | 'violet' | 'rose';
  theme: 'dark' | 'light';
}) {
  const dark = theme === 'dark';
  const accents = {
    emerald: dark ? 'from-emerald-600/30 to-emerald-900/10 text-emerald-300' : 'from-emerald-100 to-white text-emerald-800',
    amber: dark ? 'from-amber-600/30 to-amber-900/10 text-amber-300' : 'from-amber-100 to-white text-amber-900',
    blue: dark ? 'from-blue-600/30 to-blue-900/10 text-blue-300' : 'from-blue-100 to-white text-blue-800',
    violet: dark ? 'from-violet-600/30 to-violet-900/10 text-violet-300' : 'from-violet-100 to-white text-violet-800',
    rose: dark ? 'from-rose-600/30 to-rose-900/10 text-rose-300' : 'from-rose-100 to-white text-rose-800',
  };

  return (
    <article
      className={clsx(
        'rounded-2xl border p-4 md:p-5 bg-gradient-to-br shadow-sm',
        accents[accent],
        dark ? 'border-white/10' : 'border-slate-200',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-sm font-medium ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</p>
          <p className="mt-2 text-2xl md:text-[1.75rem] font-bold tabular-nums tracking-tight">{value}</p>
          {hint ? <p className={`mt-1 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{hint}</p> : null}
        </div>
        <div className={`rounded-xl p-2.5 ${dark ? 'bg-white/10' : 'bg-white shadow-sm'}`}>
          <Icon size={22} />
        </div>
      </div>
    </article>
  );
}
