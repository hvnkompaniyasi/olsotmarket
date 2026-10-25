import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { improveListingCopy } from '@/lib/ai';
import {
  aiGenerateLimiter,
  getClientIp,
  getRateLimitHeaders,
  isRateLimitConfigured,
} from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

const improveListingSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(20).max(2000),
});

export async function POST(request: NextRequest) {
  if (!isRateLimitConfigured) {
    return NextResponse.json({ error: 'AI xizmati vaqtincha ishlamayapti' }, { status: 503 });
  }

  try {
    const limit = await aiGenerateLimiter.limit(
      getClientIp(request.headers.get('x-forwarded-for')),
    );
    if (!limit.success) {
      return NextResponse.json(
        { error: 'AI limiti tugadi. Keyinroq qayta urinib ko‘ring.' },
        { status: 429, headers: getRateLimitHeaders(limit) },
      );
    }
  } catch (error) {
    console.error('AI listing edit rate limit check failed:', error);
    return NextResponse.json({ error: 'AI xizmati vaqtincha ishlamayapti' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Noto‘g‘ri so‘rov ma’lumoti' }, { status: 400 });
  }

  const parsed = improveListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Sarlavha va tavsifni to‘g‘ri to‘ldiring' },
      { status: 400 },
    );
  }

  try {
    const copy = await improveListingCopy(parsed.data.title, parsed.data.description);
    return NextResponse.json(copy);
  } catch (error) {
    console.error('AI listing edit failed:', error);
    return NextResponse.json(
      { error: 'E’lon matnini yaxshilashda xatolik yuz berdi' },
      { status: 502 },
    );
  }
}
