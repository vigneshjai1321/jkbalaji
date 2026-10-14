import type { Metadata } from 'next';
import { JK_BALAJI_RE } from '@/lib/real-estate-business';

export const RE_SITE_ORIGIN = JK_BALAJI_RE.url.replace(/\/$/, '');

export const RE_DEFAULT_OG = `${RE_SITE_ORIGIN}/assets/images/realestate.jpg`;

export const RE_SITE_NAME = JK_BALAJI_RE.name;

export function reCanonicalPath(path: string): string {
  if (!path || path === '/') return `${RE_SITE_ORIGIN}/`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${RE_SITE_ORIGIN}${p}`;
}

type PageSeo = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  /** When true, `title` is used as-is (no layout template suffix). */
  absoluteTitle?: boolean;
};

export function buildRePageMetadata(input: PageSeo): Metadata {
  const canonical = reCanonicalPath(input.path);
  const ogImage = input.ogImage ?? RE_DEFAULT_OG;
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
      siteName: RE_SITE_NAME,
      locale: 'en_IN',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: RE_SITE_NAME }],
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

/** Static public routes — titles use root layout template unless `absoluteTitle`. */
export const RE_STATIC_SEO = {
  home: {
    absoluteTitle: true,
    title: 'JK Balaji Real Estate | Residential Plots, JK Nagar & Enquiries in Cheyyar',
    description:
      'JK Balaji Real Estate — residential plots and land developments in Cheyyar and Tamil Nadu. JK Nagar Phase 1–3 enquiries, property consultancy, site visits, and NRI assistance. Call or enquire online.',
    path: '/',
    keywords: [
      'JK Balaji Real Estate',
      'residential plots Cheyyar',
      'JK Nagar Phase 1',
      'JK Nagar Phase 2',
      'JK Nagar Phase 3',
      'land for sale Tiruvannamalai',
      'property enquiry Cheyyar',
      'real estate consultancy Tamil Nadu',
    ],
  },
  about: {
    title: 'About Us',
    description:
      'Learn about JK Balaji Real Estate — plot developments, guided site visits, and documentation support from Cheyyar across Tamil Nadu.',
    path: '/about',
    keywords: ['JK Balaji about', 'real estate Cheyyar', 'plot developer Tamil Nadu'],
  },
  projects: {
    title: 'Developments & Services',
    description:
      'Explore JK Balaji developments and real estate services: residential plots, consultancy, property management, and NRI property assistance. JK Nagar phases and published projects.',
    path: '/projects',
    keywords: ['JK Balaji projects', 'residential developments Cheyyar', 'JK Nagar layouts'],
  },
  jkNagar: {
    title: 'JK Nagar Layout Phases',
    description:
      'JK Nagar residential layout in three phases near Cheyyar. Plot enquiries for Phase 1, Phase 2, and Phase 3 — availability and pricing confirmed with our team.',
    path: '/jk-nagar',
    keywords: ['JK Nagar Cheyyar', 'JK Nagar plots', 'JK Nagar layout Tamil Nadu'],
  },
  jkNagarPhase1: {
    title: 'JK Nagar Phase 1',
    description:
      'JK Nagar Phase 1 — ongoing layout development near Cheyyar. Plot enquiry, site visits, and documentation support. Confirm availability and pricing with JK Balaji Real Estate.',
    path: '/jk-nagar/phase-1',
    keywords: ['JK Nagar Phase 1', 'plots Phase 1 Cheyyar', 'JK Nagar plot enquiry'],
  },
  jkNagarPhase2: {
    title: 'JK Nagar Phase 2',
    description:
      'JK Nagar Phase 2 — ongoing development with layout and infrastructure work. Enquire for plot availability, facilities, and site visit scheduling in Cheyyar.',
    path: '/jk-nagar/phase-2',
    keywords: ['JK Nagar Phase 2', 'plots Phase 2 Cheyyar'],
  },
  jkNagarPhase3: {
    title: 'JK Nagar Phase 3',
    description:
      'JK Nagar Phase 3 — ongoing layout development. Submit a plot enquiry for availability, pricing, facilities, and site visit arrangements with our Cheyyar team.',
    path: '/jk-nagar/phase-3',
    keywords: ['JK Nagar Phase 3', 'plots Phase 3 Cheyyar'],
  },
  properties: {
    title: 'Properties & Plots',
    description:
      'Browse published JK Balaji property and plot listings in Tamil Nadu. Enquire for current availability, pricing, and site visits — listings updated when published.',
    path: '/properties',
    keywords: ['plots for sale Cheyyar', 'JK Balaji properties', 'residential land Tamil Nadu'],
  },
  location: {
    title: 'Location & Directions',
    description:
      'Find JK Balaji Real Estate in Cheyyar, Tiruvannamalai District, Tamil Nadu. Directions, map, and contact details for site visits and plot enquiries.',
    path: '/location',
    keywords: ['JK Balaji Cheyyar address', 'real estate office Cheyyar', 'plot site visit Cheyyar'],
  },
  gallery: {
    title: 'Project Gallery',
    description:
      'Photos from JK Balaji real estate layouts and plot developments in Tamil Nadu. Enquire for current site photography and visit scheduling.',
    path: '/gallery',
    keywords: ['JK Balaji gallery', 'layout photos Cheyyar', 'plot development images'],
  },
  contact: {
    title: 'Contact & Enquiries',
    description:
      `Contact JK Balaji Real Estate for plot enquiries, site visits, and property guidance. Phone ${JK_BALAJI_RE.phoneDisplay}, email ${JK_BALAJI_RE.email}, Cheyyar, Tamil Nadu.`,
    path: '/contact',
    keywords: ['JK Balaji contact', 'plot enquiry Cheyyar', 'real estate phone Cheyyar'],
  },
  faq: {
    title: 'FAQs',
    description:
      'Frequently asked questions about JK Balaji plots, JK Nagar phases, site visits, documentation, and property enquiries in Cheyyar and Tamil Nadu.',
    path: '/faq',
    keywords: ['JK Balaji FAQ', 'plot buying questions Cheyyar', 'JK Nagar enquiries'],
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'How JK Balaji Real Estate handles enquiry and contact information on jkbalaji.in.',
    path: '/privacy',
    noIndex: true,
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Terms for using jkbalaji.in and JK Balaji Real Estate enquiries — availability subject to confirmation.',
    path: '/terms',
    noIndex: true,
  },
} as const satisfies Record<string, PageSeo>;

export function reStaticMetadata(key: keyof typeof RE_STATIC_SEO): Metadata {
  return buildRePageMetadata(RE_STATIC_SEO[key]);
}
