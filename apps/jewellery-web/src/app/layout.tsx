import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Cormorant_Garamond, Source_Sans_3 } from 'next/font/google';
import '@/styles/jewellery.css';
import { SRI_BALAJI } from '@/lib/jewellery-business';
import { UnregisterPublicServiceWorker } from '@/components/UnregisterPublicServiceWorker';

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

const title = `${SRI_BALAJI.name} | Gold & Diamond Jewellery Showroom, Cheyyar`;
const description =
  'Sri Balaji Thangamaligai — gold, silver, platinum and diamond jewellery in Cheyyar, Tiruvannamalai. GST-compliant showroom. Gold savings scheme enquiries welcome.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'Sri Balaji Thangamaligai',
    'gold jewellery Cheyyar',
    'jewellery showroom Cheyyar',
    'silver articles Cheyyar',
    'diamond jewellery Tamil Nadu',
  ],
  alternates: { canonical: SRI_BALAJI.url },
  openGraph: {
    title,
    description,
    url: SRI_BALAJI.url,
    siteName: SRI_BALAJI.name,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: `${SRI_BALAJI.url}/icons/cheyyar.svg`, width: 512, height: 512, alt: SRI_BALAJI.name }],
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icons/cheyyar.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/cheyyar.svg' }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <div className={`jw-page ${serif.variable} ${sans.variable} font-[family-name:var(--font-jw-sans)]`}>{children}</div>
        <UnregisterPublicServiceWorker />
      </body>
    </html>
  );
}
