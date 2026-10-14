import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const svgs = {
  realestate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#047857"/><stop offset="100%" stop-color="#0d9488"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#g)"/><path fill="#fff" d="M16 6L6 16h3v8h14v-8h3L16 6zm-2 16v-5h4v5h-4z"/></svg>`,
  jewellery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#g)"/><path fill="#fff" d="M16 7l6 8-6 10-6-10 6-8zm0 4.2L12.8 15 16 21l3.2-6-3.2-3.8z"/></svg>`,
  admin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#10b981"/></linearGradient></defs><rect width="32" height="32" rx="7" fill="url(#g)"/><text x="16" y="21" text-anchor="middle" fill="#fff" font-family="system-ui,sans-serif" font-size="9" font-weight="800">ERP</text></svg>`,
};

export async function GET() {
  const h = await headers();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').toLowerCase();
  let svg = svgs.realestate;
  if (host.includes('cheyyarbalaji')) svg = svgs.jewellery;
  if (host.startsWith('admin.')) svg = svgs.admin;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=604800, immutable',
    },
  });
}
