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

    // 1. CORS (OPTIONS) so'rovlarini chetlab o'tish (Rate Limit yemaslik uchun)
    if (method === 'OPTIONS') {
      return NextResponse.next();
    }

    // 2. Healthcheck va ichki API'larni limitdan ozod qilish
    if (pathname === '/api/health') {
      return NextResponse.next();
    }

    // 3. Stress test uchun vaqtinchalik chetlab o'tish (faqat dev muhitda)
    const isStressTest =
      process.env.NODE_ENV !== 'production' &&
      req.headers.get('X-Stress-Test') === 'true';
    if (isStressTest) {
      return NextResponse.next();
    }

    // 4. API Rate Limiting
    if (pathname.startsWith('/api/')) {
      if (!isRateLimitConfigured) {
        return NextResponse.json(
          { error: 'Rate limiting xizmati vaqtincha ishlamayapti' },
          { status: 503 },
        );
      }

      const ip = getClientIp(req.headers.get('x-forwarded-for'));

      try {
        // Umumiy (Global) limit
        const globalLimit = await globalApiLimiter.limit(ip);
        if (!globalLimit.success) {
          return NextResponse.json(
            { error: 'Juda ko‘p so‘rov yuborildi. Keyinroq urinib ko‘ring.' },
            { status: 429, headers: getRateLimitHeaders(globalLimit) },
          );
        }

        // Faqat Login/Register (Credentials) uchun qattiqroq limit
        // NextAuth'ning session, csrf kabi ichki so'rovlariga tegmaymiz
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
        // Agar Redis ishlamay qolsa, tizimni butunlay to'xtatib qo'ymaslik uchun ruxsat beramiz (Fail-open)
        // Yoki xohlasangiz 503 qaytarishingiz mumkin (Fail-closed)
        return NextResponse.next(); 
      }

      return NextResponse.next();
    }

    // 5. Admin Panelni himoyalash (RBAC)
    if (pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  },
  {
    callbacks: {
      // API'lar o'zi ichida (route.ts da) sessiyani tekshiradi, shuning uchun bu yerda faqat sahifalarni tekshiramiz
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
  // Faqat admin va api yo'llari uchun middleware ishlaydi
  matcher: ['/admin/:path*', '/api/:path*'],
};