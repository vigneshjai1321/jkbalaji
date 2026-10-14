import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { JsonLd } from '@/components/site/JsonLd';
import { UnregisterPublicServiceWorker } from '@/components/UnregisterPublicServiceWorker';
import { RE_SITE_ORIGIN, RE_DEFAULT_OG, RE_SITE_NAME, RE_STATIC_SEO, reStaticMetadata } from '@/lib/seo/metadata';
import { reGlobalJsonLd } from '@/lib/seo/json-ld';

const rootMeta = reStaticMetadata('home');

export const metadata: Metadata = {
  metadataBase: new URL(RE_SITE_ORIGIN),
  title: {
    default: RE_STATIC_SEO.home.title,
    template: `%s | ${RE_SITE_NAME}`,
  },
  description: rootMeta.description,
  keywords: rootMeta.keywords,
  alternates: { canonical: `${RE_SITE_ORIGIN}/` },
  openGraph: rootMeta.openGraph,
  twitter: rootMeta.twitter,
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icons/jkbalaji.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/jkbalaji.svg' }],
  },
  other: {
    'og:image:secure_url': RE_DEFAULT_OG,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#064e3b',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <JsonLd data={reGlobalJsonLd()} />
        {children}
        <UnregisterPublicServiceWorker />
      </body>
    </html>
  );
}
