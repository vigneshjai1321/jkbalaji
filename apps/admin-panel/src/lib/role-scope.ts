export type AdminBusinessScope = 'all' | 'real-estate' | 'jewellery';

export function businessScopeForRole(role: string | undefined): AdminBusinessScope {
  if (role === 'GOLD_MANAGER') return 'jewellery';
  if (role === 'REAL_ESTATE_MANAGER' || role === 'SALES_MANAGER') return 'real-estate';
  return 'all';
}

const RE_PREFIXES = ['/brokers', '/commissions', '/plots', '/projects', '/realestate', '/overview/real-estate'];
const JW_PREFIXES = ['/jewellery', '/gold-rates', '/billing', '/overview/jewellery'];

export function isPathAllowedForScope(pathname: string, scope: AdminBusinessScope): boolean {
  if (scope === 'all') return true;
  const path = pathname.split('?')[0] ?? pathname;
  if (scope === 'jewellery') {
    if (RE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return false;
    return true;
  }
  if (JW_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) return false;
  return true;
}
