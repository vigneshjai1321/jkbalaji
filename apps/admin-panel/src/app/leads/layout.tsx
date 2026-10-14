import { Suspense } from 'react';

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading leads…</div>}>{children}</Suspense>;
}
