'use client';

import { AdminPanel } from '@/components/admin/AdminPanel';
import { useAdminTheme } from '@/components/admin/AdminShell';

export default function AdminSettingsPage() {
  const theme = useAdminTheme();
  const dark = theme === 'dark';
  return (
    <AdminPanel title="Settings" description="Users, roles, SMTP, and website configuration.">
      <div className={`p-8 grid md:grid-cols-2 gap-4 text-sm ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
        {[
          { t: 'Users & roles', d: 'Seed admin: admin@jkbalaji.in — rotate password in production.' },
          { t: 'Permissions', d: 'JWT roles SUPER_ADMIN, ADMIN, STAFF — extend guards per module.' },
          { t: 'SMTP', d: 'Configure mailer for invoice email and lead alerts (env on VPS).' },
          { t: 'Websites', d: 'jkbalaji.in · cheyyarbalaji.com · admin at /admin on apex domain.' },
        ].map((x) => (
          <div key={x.t} className={`rounded-xl border p-4 ${dark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200'}`}>
            <p className="font-semibold">{x.t}</p>
            <p className={`mt-2 text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>{x.d}</p>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}
