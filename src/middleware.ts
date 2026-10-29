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
    const method = req.method;
    const hostname = req.headers.get('host') || '';

    // --- 1. DOMENLARNI AJRATISH (senest.uz vs olsotmarket.uz) ---
    const isAdminDomain = hostname.includes('senest.uz');
    const isLocalhost = hostname.includes('localhost');

    // Agar admin domeniga kirilgan bo'lsa va /admin bo'lmasa, avtomatik /admin ga yo'naltirish
    if (isAdminDomain && !pathname.startsWith('/admin') && !pathname.startsWith('/api/')) {
      const redirectPath = pathname === '/' ? '/admin' : `/admin${pathname}`;
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // Agar oddiy domenda (olsotmarket.uz) /admin ga kirishga urinsa, bosh sahifaga qaytarish
    if (!isAdminDomain && !isLocalhost && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // --- 2. CORS (OPTIONS) ---
    if (method === 'OPTIONS') {
      return NextResponse.next();
    }

    // --- 3. Healthcheck ---
    if (pathname === '/api/health') {
      return NextResponse.next();
    }

    // --- 4. Stress Test ---
    const isStressTest =
      process.env.NODE_ENV !== 'production' &&
      req.headers.get('X-Stress-Test') === 'true';
    if (isStressTest) {
      return NextResponse.next();
    }

    // --- 5. API Rate Limiting ---
    if (pathname.startsWith('/api/')) {
      if (!isRateLimitConfigured) {
        return NextResponse.json(
          { error: 'Rate limiting xizmati vaqtincha ishlamayapti' },
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

        const isAuthAction = 
          pathname.includes('/api/auth/callback/') || 
          pathname.includes('/api/auth/signin') || 
          pathname.includes('/api/auth/register');

        if (isAuthAction) {
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
        return NextResponse.next(); 
      }

      return NextResponse.next();
    }

    // --- 6. Admin Panelni himoyalash (RBAC) ---
    if (pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith('/api/')) return true;
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/api/:path*', '/'],
};