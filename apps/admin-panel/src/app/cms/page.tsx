'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { useAdminTheme } from '@/components/admin/AdminShell';

export default function AdminCmsPage() {
  const { user } = useAdminAuth();
  const router = useRouter();
  const theme = useAdminTheme();
  const dark = theme === 'dark';

  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN') {
      router.replace('/leads');
    }
  }, [user, router]);

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <p className="p-8 text-sm text-slate-500">Checking access…</p>;
  }

  return (
    <AdminPanel title="Website CMS" description="Internal reference — public sites are updated via source-controlled Next.js pages.">
      <div className={`p-8 space-y-4 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
        <p>
          Public websites (<code className="text-xs bg-black/10 px-1 rounded">jkbalaji.in</code>,{' '}
          <code className="text-xs bg-black/10 px-1 rounded">cheyyarbalaji.com</code>) are deployed from the monorepo. Operational staff
          should use <strong>Leads</strong> and business modules — not this screen — for day-to-day work.
        </p>
        <p className={dark ? 'text-slate-500' : 'text-slate-500'}>
          Live listings, projects, gold rates, and enquiries continue to flow through the existing API and admin ERP modules with
          role-based access.
        </p>
      </div>
    </AdminPanel>
  );
}
