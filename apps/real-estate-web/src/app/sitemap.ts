import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const w = 'weekly' as const;
  const m = 'monthly' as const;
  const base = 'https://jkbalaji.in';
  const routes = [
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
    '/privacy',
    '/terms',
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === '' || path.startsWith('/jk-nagar') ? w : m,
    priority: path === '' ? 1 : path.startsWith('/jk-nagar') ? 0.9 : 0.7,
  }));
}
