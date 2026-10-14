'use client';

import { useQuery } from '@tanstack/react-query';
import { adminFetch } from '@/lib/admin-api';
import { AdminPanel, AdminTable } from '@/components/admin/AdminPanel';

type LoginLog = {
  id: string;
  success: boolean;
  emailAttempt: string | null;
  ipAddress: string | null;
  browser: string | null;
  device: string | null;
  loginAt: string;
  user: { name: string; email: string } | null;
};

type ActivityLog = {
  id: string;
  action: string;
  entity: string;
  summary: string;
  ipAddress: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
};

export default function AdminAuditPage() {
  const logins = useQuery({
    queryKey: ['audit-logins'],
    queryFn: () => adminFetch<LoginLog[]>('/audit/login-logs?limit=80'),
  });
  const activity = useQuery({
    queryKey: ['audit-activity'],
    queryFn: () => adminFetch<ActivityLog[]>('/audit/activity-logs?limit=80'),
  });

  return (
    <div className="space-y-6">
      <AdminPanel title="Login audit" description="Every sign-in attempt with IP, browser, and device.">
        {logins.isLoading ? (
          <div className="p-8 text-sm text-slate-500">Loading…</div>
        ) : (
          <AdminTable
            headers={['Time', 'User', 'Success', 'IP', 'Browser', 'Device']}
            rows={(logins.data ?? []).map((l) => [
              new Date(l.loginAt).toLocaleString('en-IN'),
              l.user?.email ?? l.emailAttempt ?? '—',
              l.success ? 'Yes' : 'No',
              l.ipAddress ?? '—',
              l.browser ?? '—',
              l.device ?? '—',
            ])}
          />
        )}
      </AdminPanel>

      <AdminPanel title="Activity logs" description="Create / update / delete / login events across the ERP.">
        {activity.isLoading ? (
          <div className="p-8 text-sm text-slate-500">Loading…</div>
        ) : (
          <AdminTable
            headers={['Time', 'User', 'Action', 'Entity', 'Summary', 'IP']}
            rows={(activity.data ?? []).map((a) => [
              new Date(a.createdAt).toLocaleString('en-IN'),
              a.user?.name ?? 'System',
              a.action,
              a.entity,
              a.summary,
              a.ipAddress ?? '—',
            ])}
          />
        )}
      </AdminPanel>
    </div>
  );
}
