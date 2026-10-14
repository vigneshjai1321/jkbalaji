'use client';

import { DashboardView } from '@/components/admin/DashboardView';
import { useAdminTheme } from '@/components/admin/AdminShell';

export default function AnalyticsPage() {
  const theme = useAdminTheme();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Business Analytics</h1>
      <p className="text-sm opacity-70 mb-6">Revenue, CRM, and operational KPIs — same data as CEO dashboard with chart focus.</p>
      <DashboardView theme={theme} showBusinessCards={false} />
    </div>
  );
}
