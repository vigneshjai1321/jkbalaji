import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const w = 'weekly' as const;
  const m = 'monthly' as const;
  const base = 'https://cheyyarbalaji.com';
  const routes = [
    '',
    '/about',
    '/collections',
    '/collections/gold',
    '/collections/silver',
    '/collections/platinum',
    '/collections/diamond',
    '/gold-schemes',
    '/services',
    '/gallery',
    '/gold-rates',
    '/visit',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === '' || path === '/gold-rates' ? w : m,
    priority: path === '' ? 1 : 0.75,
  }));
}
