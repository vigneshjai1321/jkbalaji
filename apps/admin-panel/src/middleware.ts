import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Legacy login redirect and bookmarks used /admin; this app lives at /. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/'],
};
