export type AdminBusinessScope = 'all' | 'real-estate' | 'jewellery';

export function businessScopeForRole(role: string | undefined): AdminBusinessScope {
  if (role === 'GOLD_MANAGER') return 'jewellery';
  if (role === 'REAL_ESTATE_MANAGER' || role === 'SALES_MANAGER') return 'real-estate';
  return 'all';
}

const RE_PREFIXES = ['/brokers', '/commissions', '/plots', '/projects', '/realestate', '/overview/real-estate'];
const JW_PREFIXES = ['/jewellery', '/gold-rates', '/billing', '/overview/jewellery'];

/** ERP areas reserved for super/admin staff — not department managers. */
const ADMIN_ONLY_PREFIXES = ['/users', '/accounting', '/expenses', '/reports', '/audit', '/cms'];

export function isPathAllowedForScope(pathname: string, scope: AdminBusinessScope): boolean {
  if (scope === 'all') return true;
  const path = pathname.split('?')[0] ?? pathname;

  if (ADMIN_ONLY_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return false;

  if (path === '/' || path === '/analytics') return false;

  if (scope === 'jewellery') {
    if (RE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return false;
    if (path === '/inventory' || path.startsWith('/inventory/')) return true;
    if (path === '/settings') return false;
    return true;
  }

  // real-estate scope
  if (JW_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return false;
  if (path === '/inventory' || path.startsWith('/inventory/')) return false;
  if (path === '/settings') return true;
  return true;
}

export function defaultHomeForScope(scope: AdminBusinessScope): string {
  if (scope === 'jewellery') return '/overview/jewellery';
  if (scope === 'real-estate') return '/overview/real-estate';
  return '/';
}
