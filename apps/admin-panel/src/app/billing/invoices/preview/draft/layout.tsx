import { Suspense } from 'react';

export default function DraftPreviewLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<p className="p-8 text-slate-600">Loading preview…</p>}>{children}</Suspense>;
}
