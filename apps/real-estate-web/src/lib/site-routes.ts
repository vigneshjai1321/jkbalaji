/** Public route map — jkbalaji.in */
export const RE_ROUTES = {
  home: '/',
  about: '/about',
  projects: '/projects',
  jkNagar: '/jk-nagar',
  jkNagarPhase1: '/jk-nagar/phase-1',
  jkNagarPhase2: '/jk-nagar/phase-2',
  jkNagarPhase3: '/jk-nagar/phase-3',
  properties: '/properties',
  property: (slug: string) => `/properties/${slug}` as const,
  location: '/location',
  gallery: '/gallery',
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export type ReNavItem =
  | { href: string; label: string; dropdown?: false }
  | { href: string; label: string; dropdown: true };

export const RE_NAV_PRIMARY: ReNavItem[] = [
  { href: RE_ROUTES.home, label: 'Home' },
  { href: RE_ROUTES.about, label: 'About' },
  { href: RE_ROUTES.projects, label: 'Projects', dropdown: true },
  { href: RE_ROUTES.gallery, label: 'Gallery' },
  { href: RE_ROUTES.contact, label: 'Contact' },
];

export const RE_PROJECTS_DROPDOWN = [
  { href: RE_ROUTES.projects, label: 'All projects' },
  { href: RE_ROUTES.jkNagar, label: 'JK Nagar overview' },
  { href: RE_ROUTES.jkNagarPhase1, label: 'JK Nagar Phase 1' },
  { href: RE_ROUTES.jkNagarPhase2, label: 'JK Nagar Phase 2' },
  { href: RE_ROUTES.jkNagarPhase3, label: 'JK Nagar Phase 3' },
  { href: RE_ROUTES.properties, label: 'Available plots' },
] as const;
