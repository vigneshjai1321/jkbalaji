/** Public route map — cheyyarbalaji.com */
export const JW_ROUTES = {
  home: '/',
  about: '/about',
  collections: '/collections',
  collection: (id: string) => `/collections/${id}` as const,
  goldSchemes: '/gold-schemes',
  services: '/services',
  gallery: '/gallery',
  goldRates: '/gold-rates',
  visit: '/visit',
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export type JwNavItem =
  | { href: string; label: string; dropdown?: false }
  | { href: string; label: string; dropdown: true };

export const JW_NAV_PRIMARY: JwNavItem[] = [
  { href: JW_ROUTES.home, label: 'Home' },
  { href: JW_ROUTES.about, label: 'About' },
  { href: JW_ROUTES.collections, label: 'Collections', dropdown: true },
  { href: JW_ROUTES.goldRates, label: 'Gold Rates' },
  { href: JW_ROUTES.contact, label: 'Contact' },
];

export const JW_COLLECTIONS_DROPDOWN = [
  { href: JW_ROUTES.collections, label: 'All collections' },
  { href: JW_ROUTES.collection('gold'), label: 'Gold jewellery' },
  { href: JW_ROUTES.collection('silver'), label: 'Silver articles' },
  { href: JW_ROUTES.collection('platinum'), label: 'Platinum jewellery' },
  { href: JW_ROUTES.collection('diamond'), label: 'Diamond jewellery' },
  { href: JW_ROUTES.goldSchemes, label: 'Gold savings scheme' },
  { href: JW_ROUTES.services, label: 'Services' },
  { href: JW_ROUTES.gallery, label: 'Gallery' },
  { href: JW_ROUTES.visit, label: 'Visit showroom' },
  { href: JW_ROUTES.faq, label: 'FAQs' },
] as const;
