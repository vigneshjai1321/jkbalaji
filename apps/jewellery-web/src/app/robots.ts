import type { MetadataRoute } from 'next';
import { JW_SITE_ORIGIN } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api', '/api/'],
    },
    sitemap: `${JW_SITE_ORIGIN}/sitemap.xml`,
    host: JW_SITE_ORIGIN,
  };
}
