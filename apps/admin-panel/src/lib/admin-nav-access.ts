import type { NavGroup } from '@/components/admin/admin-nav';

const CMS_ROLES = new Set(['SUPER_ADMIN']);
const WEBSITE_CATALOG_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'REAL_ESTATE_MANAGER', 'GOLD_MANAGER']);

/** Hide public website CMS and catalogue editing from operational staff roles. */
export function filterNavGroupsForRole(groups: NavGroup[], role: string): NavGroup[] {
  const canCms = CMS_ROLES.has(role);
  const canWebsiteCatalog = WEBSITE_CATALOG_ROLES.has(role);

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.href === '/cms') return canCms;
        if (item.href === '/realestate' || item.href === '/projects') return canWebsiteCatalog;
        if (item.href === '/jewellery') return canWebsiteCatalog;
        return true;
      }),
    }))
    .filter((g) => g.items.length > 0);
}
