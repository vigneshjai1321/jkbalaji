'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { businessScopeForRole, defaultHomeForScope, isPathAllowedForScope } from '@/lib/role-scope';

export function AdminScopeGuard({ role, children }: { role: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const scope = businessScopeForRole(role);

  useEffect(() => {
    if (!isPathAllowedForScope(pathname, scope)) {
      router.replace(defaultHomeForScope(scope));
    }
  }, [pathname, router, scope]);

  if (!isPathAllowedForScope(pathname, scope)) {
    return (
      <div className="p-8 text-sm text-slate-600">
        You do not have access to this section.
      </div>
    );
  }

  return <>{children}</>;
}
