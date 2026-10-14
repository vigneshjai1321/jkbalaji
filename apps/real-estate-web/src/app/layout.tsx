import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { UnregisterPublicServiceWorker } from '@/components/UnregisterPublicServiceWorker';

const title = 'JK Balaji Real Estate | Premium Plots & Villas in Tamil Nadu';
const description =
  'Premium real estate brand across Tamil Nadu — luxury properties, DTCP-approved plots, villas, commercial spaces, and investment opportunities. Enquire at jkbalaji.in.';
const url = 'https://jkbalaji.in/';

export const metadata: Metadata = {
  title,
  description,
  keywords: ['real estate Tamil Nadu', 'plots Cheyyar', 'DTCP approved layouts', 'JK Balaji', 'property investment'],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    siteName: 'JK Balaji Real Estate',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: 'https://jkbalaji.in/icons/jkbalaji.svg', width: 512, height: 512, alt: 'JK Balaji Real Estate' }],
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: '/icons/jkbalaji.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/jkbalaji.svg' }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        {children}
        <UnregisterPublicServiceWorker />
      </body>
    </html>
  );
}
