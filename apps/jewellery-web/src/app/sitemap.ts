import type { MetadataRoute } from 'next';
import { JEWELLERY_COLLECTIONS } from '@/lib/jewellery-collections';
import { JW_SITE_ORIGIN } from '@/lib/seo/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const w = 'weekly' as const;
  const m = 'monthly' as const;
  const base = JW_SITE_ORIGIN;

  const staticRoutes = [
    '',
    '/about',
    '/collections',
    '/gold-schemes',
    '/services',
    '/gallery',
    '/gold-rates',
    '/visit',
    '/contact',
    '/faq',
  ].map((path) => ({
    url: path ? `${base}${path}` : `${base}/`,
    lastModified,
    changeFrequency: path === '' || path === '/gold-rates' ? w : m,
    priority: path === '' ? 1 : path === '/gold-rates' ? 0.85 : 0.75,
  }));

  const collectionRoutes = JEWELLERY_COLLECTIONS.map((c) => ({
    url: `${base}/collections/${c.id}`,
    lastModified,
    changeFrequency: m,
    priority: 0.8,
  }));

  return [...staticRoutes, ...collectionRoutes];
}
