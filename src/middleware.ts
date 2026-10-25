import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import {
  authLimiter,
  getClientIp,
  getRateLimitHeaders,
  globalApiLimiter,
  isRateLimitConfigured,
} from '@/lib/ratelimit';

export default withAuth(
  async function middleware(req) {
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith('/api/')) {
      if (!isRateLimitConfigured) {
        return NextResponse.json(
          { error: 'Rate limiting is not configured' },
          { status: 503 },
        );
      }

      const ip = getClientIp(req.headers.get('x-forwarded-for'));

      try {
        const globalLimit = await globalApiLimiter.limit(ip);
        if (!globalLimit.success) {
          return NextResponse.json(
            { error: 'Juda ko‘p so‘rov yuborildi. Keyinroq urinib ko‘ring.' },
            { status: 429, headers: getRateLimitHeaders(globalLimit) },
          );
        }

        if (pathname.startsWith('/api/auth/')) {
          const authLimit = await authLimiter.limit(ip);
          if (!authLimit.success) {
            return NextResponse.json(
              { error: 'Juda ko‘p autentifikatsiya so‘rovi yuborildi. Keyinroq urinib ko‘ring.' },
              { status: 429, headers: getRateLimitHeaders(authLimit) },
            );
          }
        }
      } catch (error) {
        console.error('API rate limit check failed:', error);
        return NextResponse.json(
          { error: 'Rate limiting xizmati vaqtincha ishlamayapti' },
          { status: 503 },
        );
      }

      return NextResponse.next();
    }

    // Faqat /admin bilan boshlanadigan sahifalar uchun
    if (pathname.startsWith('/admin')) {
      // Agar foydalanuvchi ADMIN bo'lmasa, bosh sahifaga qaytaramiz
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) =>
        req.nextUrl.pathname.startsWith('/api/') || !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};