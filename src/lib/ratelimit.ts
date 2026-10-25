import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRateLimitConfigured = Boolean(redisUrl && redisToken);

const redis = new Redis({
  url: redisUrl ?? 'https://upstash-redis-not-configured.invalid',
  token: redisToken ?? 'upstash-redis-not-configured',
});

export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'olsot:auth',
  analytics: true,
});

export const listingCreateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(15, '1 h'),
  prefix: 'olsot:listing-create',
  analytics: true,
});

export const globalApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'olsot:global-api',
  analytics: true,
});

export function getClientIp(forwardedFor: string | null): string {
  return forwardedFor?.split(',')[0]?.trim() || 'unknown';
}

export function getRateLimitHeaders(
  result: Pick<
    Awaited<ReturnType<typeof globalApiLimiter.limit>>,
    'limit' | 'remaining' | 'reset'
  >,
): Headers {
  return new Headers({
    'Retry-After': String(Math.max(0, Math.ceil((result.reset - Date.now()) / 1000))),
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.reset),
  });
}
