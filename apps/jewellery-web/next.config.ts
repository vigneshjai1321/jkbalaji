import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Next.js 15 configuration (no feature code).
 * - output 'standalone': minimal self-contained server for PM2 on a small VPS
 *   (.next/standalone/apps/web/server.js) - much lower RAM/disk than `next start` + full node_modules.
 * - outputFileTracingRoot: monorepo root, so workspace packages are traced into the standalone bundle.
 * - The browser calls the API on the SAME origin (/api/v1/...), routed by Nginx -> no CORS in production.
 *   In development, rewrites proxy /api/* to the Nest dev server.
 */
const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:4000';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  poweredByHeader: false,
  compress: false, // Nginx handles gzip
  transpilePackages: ['@jkbalaji/types'],
  typedRoutes: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'production') return [];
    return [{ source: '/api/:path*', destination: `${API_INTERNAL_URL}/api/:path*` }];
  },
};

export default nextConfig;
