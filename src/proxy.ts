import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — no auth check
  if (
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const sitePassword = process.env.SITE_PASSWORD;
  // If no password is configured (local dev without env), allow through
  if (!sitePassword) return NextResponse.next();

  const siteAuth = request.cookies.get('site-auth')?.value;
  if (siteAuth === sitePassword) return NextResponse.next();

  // Redirect to login, preserving destination
  const loginUrl = new URL('/login', request.url);
  if (pathname !== '/') loginUrl.searchParams.set('from', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
