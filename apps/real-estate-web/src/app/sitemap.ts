import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const w = 'weekly' as const;
  const m = 'monthly' as const;
  return [
    { url: 'https://jkbalaji.in/', lastModified, changeFrequency: w, priority: 1 },
    { url: 'https://jkbalaji.in/about', lastModified, changeFrequency: m, priority: 0.7 },
    { url: 'https://jkbalaji.in/jk-nagar', lastModified, changeFrequency: w, priority: 0.9 },
    { url: 'https://jkbalaji.in/privacy', lastModified, changeFrequency: m, priority: 0.3 },
    { url: 'https://jkbalaji.in/terms', lastModified, changeFrequency: m, priority: 0.3 },
  ];
}
