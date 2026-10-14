'use client';

import { DashboardView } from '@/components/admin/DashboardView';
import { useAdminTheme } from '@/components/admin/AdminShell';

export default function AdminDashboardPage() {
  const theme = useAdminTheme();
  return <DashboardView theme={theme} />;
}
