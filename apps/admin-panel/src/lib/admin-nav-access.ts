import type { NavGroup } from '@/components/admin/admin-nav';
import { businessScopeForRole } from '@/lib/role-scope';

const CMS_ROLES = new Set(['SUPER_ADMIN']);
const WEBSITE_CATALOG_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'REAL_ESTATE_MANAGER', 'GOLD_MANAGER']);

/** Hide public website CMS and catalogue editing from operational staff roles. */
export function filterNavGroupsForRole(groups: NavGroup[], role: string): NavGroup[] {
  const scope = businessScopeForRole(role);
  const canCms = CMS_ROLES.has(role);
  const canWebsiteCatalog = WEBSITE_CATALOG_ROLES.has(role);

  const adminOnlyHrefs = new Set([
    '/users',
    '/accounting',
    '/expenses',
    '/reports',
    '/audit',
    '/cms',
    '/analytics',
  ]);

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (scope !== 'all' && adminOnlyHrefs.has(item.href)) return false;
        if (scope === 'real-estate' && item.href === '/inventory') return false;
        if (scope === 'jewellery' && item.href === '/settings') return false;
        if (scope !== 'all' && item.href === '/') return false;
        if (scope === 'real-estate' && group.title === 'Jewellery') return false;
        if (scope === 'jewellery' && group.title === 'Real Estate') return false;
        if (scope === 'real-estate' && item.href === '/commissions') return true;
        if (scope === 'jewellery' && (item.href === '/brokers' || item.href === '/commissions')) return false;
        if (item.href === '/cms') return canCms;
        if (item.href === '/realestate' || item.href === '/projects') return canWebsiteCatalog;
        if (item.href === '/jewellery') return canWebsiteCatalog;
        if (scope === 'jewellery' && item.href.startsWith('/leads') && !item.href.includes('JEWELLERY')) {
          return item.href.includes('JEWELLERY');
        }
        if (scope === 'real-estate' && item.href.startsWith('/leads') && item.href.includes('JEWELLERY')) return false;
        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);
}
