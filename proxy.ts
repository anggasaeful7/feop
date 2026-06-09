import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

const publicPages = ['/login', '/forgot-password'];

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('ipl_access_token')?.value;
  const pathname = request.nextUrl.pathname;

  // Bypass /api routes so they are handled by Next.js rewrites
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isPublicPage = publicPages.some(
    (page) => pathname === page || pathname.startsWith(`/id${page}`) || pathname.startsWith(`/en${page}`)
  );

  if (!token && !isPublicPage && pathname !== '/') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublicPage) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  const response = intlMiddleware(request);
  return response;
}

export const config = {
  matcher: [
    '/',
    '/(id|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
