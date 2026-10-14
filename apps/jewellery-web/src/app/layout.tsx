import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';
import '@/styles/jewellery.css';
import { JsonLd } from '@/components/site/JsonLd';
import { UnregisterPublicServiceWorker } from '@/components/UnregisterPublicServiceWorker';
import { jwStaticMetadata, JW_DEFAULT_OG, JW_SITE_NAME, JW_SITE_ORIGIN, JW_STATIC_SEO } from '@/lib/seo/metadata';
import { jwGlobalJsonLd } from '@/lib/seo/json-ld';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jw-serif',
  display: 'swap',
});

const sans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jw-sans',
  display: 'swap',
});

const rootMeta = jwStaticMetadata('home');

export const metadata: Metadata = {
  metadataBase: new URL(JW_SITE_ORIGIN),
  title: {
    default: JW_STATIC_SEO.home.title,
    template: `%s | ${JW_SITE_NAME}`,
  },
  description: rootMeta.description,
  keywords: rootMeta.keywords,
  alternates: { canonical: `${JW_SITE_ORIGIN}/` },
  openGraph: rootMeta.openGraph,
  twitter: rootMeta.twitter,
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icons/cheyyar.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/cheyyar.svg' }],
  },
  other: {
    'og:image:secure_url': JW_DEFAULT_OG,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1c1917',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <JsonLd data={jwGlobalJsonLd()} />
        <div className={`jw-page ${serif.variable} ${sans.variable} font-[family-name:var(--font-jw-sans)]`}>{children}</div>
        <UnregisterPublicServiceWorker />
      </body>
    </html>
  );
}
