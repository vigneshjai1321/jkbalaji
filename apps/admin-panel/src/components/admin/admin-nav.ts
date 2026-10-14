import {
  LayoutDashboard,
  Building2,
  MapPin,
  FolderKanban,
  Gem,
  Coins,
  Receipt,
  Package,
  BookOpen,
  Wallet,
  Users,
  Kanban,
  BarChart3,
  Shield,
  ScrollText,
  Globe,
  Settings,
  UserCircle,
  Inbox,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  hint?: string;
  jewelleryAccent?: boolean;
};

export type NavGroup = { title: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'General',
    items: [
      { href: '/', label: 'All Businesses', icon: LayoutDashboard, exact: true, hint: 'Combined overview' },
      { href: '/leads', label: 'All Leads', icon: Inbox, exact: true, hint: 'Every website enquiry' },
      { href: '/crm', label: 'CRM', icon: Kanban, hint: 'Lead pipeline board' },
      { href: '/customers', label: 'Customers', icon: Users, hint: 'Customer records' },
    ],
  },
  {
    title: 'Real Estate',
    items: [
      { href: '/overview/real-estate', label: 'Overview', icon: LayoutDashboard, exact: true, hint: 'Real estate summary' },
      { href: '/realestate', label: 'Properties', icon: Building2, hint: 'Listings & gallery' },
      { href: '/projects', label: 'Projects', icon: FolderKanban, hint: 'Developments' },
      { href: '/plots', label: 'Plots', icon: MapPin, hint: 'Plot inventory' },
      { href: '/brokers', label: 'Brokers', icon: Users, hint: 'Agents and commissions' },
      { href: '/leads?site=REAL_ESTATE', label: 'Real Estate Leads', icon: Inbox, hint: 'jkbalaji.in enquiries' },
    ],
  },
  {
    title: 'Jewellery',
    items: [
      { href: '/overview/jewellery', label: 'Overview', icon: LayoutDashboard, exact: true, jewelleryAccent: true, hint: 'Jewellery summary' },
      { href: '/jewellery', label: 'Products', icon: Gem, jewelleryAccent: true, hint: 'Catalogue SKUs' },
      { href: '/leads?site=JEWELLERY', label: 'Jewellery Enquiries', icon: Inbox, jewelleryAccent: true },
      { href: '/leads?site=JEWELLERY&scheme=1', label: 'Gold Scheme Enquiries', icon: Coins, jewelleryAccent: true },
      { href: '/gold-rates', label: 'Gold Rates', icon: Coins, jewelleryAccent: true },
      { href: '/billing', label: 'Gold Billing', icon: Receipt, jewelleryAccent: true },
    ],
  },
  {
    title: 'Administration',
    items: [
      { href: '/users', label: 'Users & Roles', icon: Shield, hint: 'Access control' },
      { href: '/accounting', label: 'Accounting', icon: BookOpen },
      { href: '/expenses', label: 'Expenses', icon: Wallet },
      { href: '/reports', label: 'Reports', icon: BarChart3 },
      { href: '/inventory', label: 'Inventory', icon: Package },
      { href: '/audit', label: 'Audit Logs', icon: ScrollText },
      { href: '/cms', label: 'Website CMS', icon: Globe },
      { href: '/settings', label: 'Settings', icon: Settings },
      { href: '/profile', label: 'Profile & Security', icon: UserCircle },
    ],
  },
];

/** Match sidebar link against current route (including query filters on /leads). */
export function navItemIsActive(pathname: string, search: string, href: string, exact?: boolean): boolean {
  const [pathPart, query] = href.split('?');
  const path = pathPart ?? href;
  const normPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  const curPath = pathname.endsWith('/') && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  if (query) {
    if (curPath !== normPath) return false;
    const expected = new URLSearchParams(query);
    const current = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
    for (const [key, value] of expected.entries()) {
      if (current.get(key) !== value) return false;
    }
    return true;
  }

  if (exact) return curPath === normPath;
  if (normPath === '/leads' && curPath === '/leads' && search.replace(/^\?/, '').length > 0) return false;
  return curPath === normPath || curPath.startsWith(`${normPath}/`);
}
