import type { Metadata } from 'next';
import { SRI_BALAJI } from '@/lib/jewellery-business';

export const JW_SITE_ORIGIN = SRI_BALAJI.url.replace(/\/$/, '');

export const JW_DEFAULT_OG = `${JW_SITE_ORIGIN}/assets/images/jewels1.jpg`;

export const JW_SITE_NAME = SRI_BALAJI.name;

export function jwCanonicalPath(path: string): string {
  if (!path || path === '/') return `${JW_SITE_ORIGIN}/`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${JW_SITE_ORIGIN}${p}`;
}

type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
};

export function buildJwPageMetadata(input: PageSeo): Metadata {
  const canonical = jwCanonicalPath(input.path);
  const ogImage = input.ogImage ?? JW_DEFAULT_OG;
  const title = input.absoluteTitle ? { absolute: input.title } : input.title;

  return {
    title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical },
    openGraph: {
      title: typeof title === 'string' ? title : input.title,
      description: input.description,
      url: canonical,
      siteName: JW_SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: JW_SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: typeof title === 'string' ? title : input.title,
      description: input.description,
      images: [ogImage],
    },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const JW_STATIC_SEO = {
  home: {
    absoluteTitle: true,
    title: 'Sri Balaji Thangamaligai | Gold & Diamond Jewellery Showroom, Cheyyar',
    description:
      'Sri Balaji Thangamaligai on Gandhi Road, Cheyyar — gold, silver, platinum and diamond jewellery. Gold scheme enquiries, reference rates, bridal and daily-wear collections. Visit our showroom.',
    path: '/',
    keywords: [
      'Sri Balaji Thangamaligai',
      'gold jewellery Cheyyar',
      'jewellery shop Cheyyar',
      'silver jewellery Tiruvannamalai',
      'diamond jewellery Cheyyar',
      'gold scheme Cheyyar',
    ],
  },
  about: {
    title: 'About the Showroom',
    description:
      'About Sri Balaji Thangamaligai — gold, silver, platinum and diamond jewellery in Cheyyar with GST billing and over a decade of local service.',
    path: '/about',
    keywords: ['Sri Balaji Cheyyar', 'jewellers Cheyyar history', 'Thangamaligai Cheyyar'],
  },
  collections: {
    title: 'Jewellery Collections',
    description:
      'Explore gold, silver, platinum and diamond jewellery collections at Sri Balaji Thangamaligai, Cheyyar — rings, necklaces, bangles, bridal sets and more. Visit for current stock.',
    path: '/collections',
    keywords: ['gold jewellery collections Cheyyar', 'bridal jewellery Cheyyar', 'silver articles Cheyyar'],
  },
  goldRates: {
    title: 'Gold & Silver Reference Rates',
    description:
      'Reference MJDTA gold and silver rates for Sri Balaji Thangamaligai customers when configured on our server — not final showroom selling prices. Confirm in store.',
    path: '/gold-rates',
    keywords: ['gold rate Cheyyar', 'silver rate Cheyyar', 'jewellery rates Tamil Nadu'],
  },
  goldSchemes: {
    title: 'Gold Savings Scheme Enquiry',
    description:
      'Enquire about the gold savings scheme at Sri Balaji Thangamaligai, Cheyyar — contributions from ₹5,000 to ₹1,00,000. Enrolment and payment in showroom when approved.',
    path: '/gold-schemes',
    keywords: ['gold scheme Cheyyar', 'jewellery savings scheme', 'monthly gold scheme enquiry'],
  },
  services: {
    title: 'Jewellery Services',
    description:
      'Repairs, exchange, customization and other jewellery services at Sri Balaji Thangamaligai, Cheyyar — ask in the showroom for current offerings.',
    path: '/services',
    keywords: ['jewellery repair Cheyyar', 'gold exchange Cheyyar', 'custom jewellery Cheyyar'],
  },
  gallery: {
    title: 'Showroom Gallery',
    description:
      'Illustrative jewellery photography from Sri Balaji Thangamaligai, Cheyyar — visit Gandhi Road for current designs, weight, and pricing.',
    path: '/gallery',
    keywords: ['jewellery gallery Cheyyar', 'gold necklace designs Cheyyar'],
  },
  visit: {
    title: 'Visit the Showroom',
    description:
      'Visit Sri Balaji Thangamaligai at No. 49/3, Gandhi Road, Cheyyar — showroom hours, directions, and contact for gold and diamond jewellery.',
    path: '/visit',
    keywords: ['jewellery shop Gandhi Road Cheyyar', 'showroom visit Cheyyar', 'Sri Balaji address'],
  },
  contact: {
    title: 'Contact & Enquiries',
    description:
      `Contact Sri Balaji Thangamaligai — ${SRI_BALAJI.phoneDisplay}, ${SRI_BALAJI.email}, Gandhi Road, Cheyyar. Jewellery and gold scheme enquiries welcome.`,
    path: '/contact',
    keywords: ['jewellery contact Cheyyar', 'Sri Balaji phone number', 'gold enquiry Cheyyar'],
  },
  faq: {
    title: 'FAQs',
    description:
      'FAQs about Sri Balaji Thangamaligai — gold rates, making charges, gold savings scheme, purity, and showroom visits in Cheyyar.',
    path: '/faq',
    keywords: ['jewellery FAQ Cheyyar', 'gold scheme questions', 'making charges jewellery'],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'Privacy policy for cheyyarbalaji.com and Sri Balaji Thangamaligai customer enquiries.',
    path: '/privacy',
    noIndex: true,
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Terms for using cheyyarbalaji.com — rates and availability confirmed in the showroom.',
    path: '/terms',
    noIndex: true,
  },
} as const satisfies Record<string, PageSeo>;

export function jwStaticMetadata(key: keyof typeof JW_STATIC_SEO): Metadata {
  return buildJwPageMetadata(JW_STATIC_SEO[key]);
}
