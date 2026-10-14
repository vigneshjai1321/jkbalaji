import type { MetadataRoute } from 'next';
import { RE_SITE_ORIGIN } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api', '/api/'],
    },
    sitemap: `${RE_SITE_ORIGIN}/sitemap.xml`,
    host: RE_SITE_ORIGIN,
  };
}
