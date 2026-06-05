import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  console.log('--- PROXY RUNNING ---');
  console.log('Request URL:', request.url);
  console.log('Request pathname:', request.nextUrl.pathname);

  const response = intlMiddleware(request);

  console.log('Response status:', response ? response.status : 'undefined');
  console.log('Response headers Location:', response ? response.headers.get('Location') : 'undefined');
  console.log('Response headers x-middleware-rewrite:', response ? response.headers.get('x-middleware-rewrite') : 'undefined');
  console.log('---------------------');

  return response;
}

export const config = {
  matcher: [
    '/',
    '/(id|en)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
