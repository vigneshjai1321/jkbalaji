import { JK_BALAJI_RE } from '@/lib/real-estate-business';
import { RE_SITE_ORIGIN } from './metadata';

export function reOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${RE_SITE_ORIGIN}/#organization`,
    name: JK_BALAJI_RE.name,
    url: `${RE_SITE_ORIGIN}/`,
    email: JK_BALAJI_RE.email,
    telephone: JK_BALAJI_RE.phoneE164,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Tamil Nadu, India',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cheyyar',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
  };
}

export function reWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${RE_SITE_ORIGIN}/#website`,
    name: JK_BALAJI_RE.name,
    url: `${RE_SITE_ORIGIN}/`,
    publisher: { '@id': `${RE_SITE_ORIGIN}/#organization` },
    inLanguage: 'en-IN',
  };
}

export function reGlobalJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [reOrganizationJsonLd(), reWebSiteJsonLd()],
  };
}

export function reBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${RE_SITE_ORIGIN}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

export function reRealEstateListingJsonLd(input: {
  name: string;
  description?: string | null;
  url: string;
  location: string;
  priceInr: string;
  image?: string | null;
}) {
  const listing: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: input.name,
    url: input.url,
    description: input.description ?? `Property listing in ${input.location}`,
    offers: {
      '@type': 'Offer',
      price: Number(input.priceInr),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  };
  if (input.image) listing.image = input.image;
  return listing;
}
