import type { MetadataRoute } from 'next';
import { apiGet } from '@/lib/api';
import { RE_SITE_ORIGIN } from '@/lib/seo/metadata';

type Property = { slug: string; updatedAt?: string };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const w = 'weekly' as const;
  const m = 'monthly' as const;
  const base = RE_SITE_ORIGIN;

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/projects',
    '/jk-nagar',
    '/jk-nagar/phase-1',
    '/jk-nagar/phase-2',
    '/jk-nagar/phase-3',
    '/properties',
    '/location',
    '/gallery',
    '/contact',
    '/faq',
  ].map((path) => ({
    url: path ? `${base}${path}` : `${base}/`,
    lastModified,
    changeFrequency: path === '' || path.startsWith('/jk-nagar') ? w : m,
    priority: path === '' ? 1 : path.startsWith('/jk-nagar') ? 0.9 : 0.75,
  }));

  let propertyEntries: MetadataRoute.Sitemap = [];
  try {
    const properties = await apiGet<Property[]>('/public/properties');
    propertyEntries = properties.map((p) => ({
      url: `${base}/properties/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : lastModified,
      changeFrequency: w,
      priority: 0.8,
    }));
  } catch {
    propertyEntries = [];
  }

  return [...staticRoutes, ...propertyEntries];
}
