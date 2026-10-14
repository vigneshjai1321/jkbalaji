import { SRI_BALAJI } from '@/lib/jewellery-business';
import { JW_SITE_ORIGIN } from './metadata';

export function jwJewelryStoreJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    '@id': `${JW_SITE_ORIGIN}/#store`,
    name: SRI_BALAJI.name,
    url: `${JW_SITE_ORIGIN}/`,
    telephone: SRI_BALAJI.phoneE164,
    email: SRI_BALAJI.email,
    description: SRI_BALAJI.tagline,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No. 49/3, Gandhi Road',
      addressLocality: 'Cheyyar',
      addressRegion: 'Tamil Nadu',
      postalCode: '604407',
      addressCountry: 'IN',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
  };
}

export function jwOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${JW_SITE_ORIGIN}/#organization`,
    name: SRI_BALAJI.name,
    url: `${JW_SITE_ORIGIN}/`,
    logo: `${JW_SITE_ORIGIN}/icons/cheyyar.svg`,
  };
}

export function jwWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${JW_SITE_ORIGIN}/#website`,
    name: SRI_BALAJI.name,
    url: `${JW_SITE_ORIGIN}/`,
    publisher: { '@id': `${JW_SITE_ORIGIN}/#organization` },
    inLanguage: 'en-IN',
  };
}

export function jwGlobalJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [jwOrganizationJsonLd(), jwWebSiteJsonLd(), jwJewelryStoreJsonLd()],
  };
}

export function jwBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.path.startsWith('http') ? item.path : `${JW_SITE_ORIGIN}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}

export function jwCollectionProductJsonLd(input: {
  name: string;
  description: string;
  url: string;
  image?: string;
  category?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
    url: input.url,
    category: input.category ?? input.name,
    brand: {
      '@type': 'Brand',
      name: SRI_BALAJI.name,
    },
    ...(input.image ? { image: input.image } : {}),
  };
}
