import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: 'https://cheyyarbalaji.com/', lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: 'https://cheyyarbalaji.com/privacy', lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://cheyyarbalaji.com/terms', lastModified, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
