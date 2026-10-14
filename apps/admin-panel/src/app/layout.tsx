import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { AdminRoot } from '@/components/admin/AdminRoot';
import { PwaManager } from '@/components/PwaManager';

export const metadata: Metadata = {
  title: 'JK Balaji ERP · Admin',
  description: 'Enterprise CRM, real estate, and gold billing',
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'JK Admin', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <AdminRoot>{children}</AdminRoot>
        <PwaManager />
      </body>
    </html>
  );
}
