import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateListingDescription } from '@/lib/ai';
import {
  aiGenerateLimiter,
  getClientIp,
  getRateLimitHeaders,
  isRateLimitConfigured,
} from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

const generateDescriptionSchema = z.object({
  title: z.string().trim().min(1).max(120),
  region: z.string().trim().max(50).default(''),
  district: z.string().trim().min(1).max(50),
  rooms: z.number().int().min(0).max(20).optional(),
  area: z.number().positive().max(100_000).optional(),
  price: z.number().positive().max(1_000_000_000_000),
  category: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  features: z.array(z.string().trim().min(1).max(100)).max(20).optional(),
});

export async function POST(request: NextRequest) {
  if (!isRateLimitConfigured) {
    return NextResponse.json(
      { error: 'Rate limiting xizmati sozlanmagan' },
      { status: 503 },
    );
  }

  const ip = getClientIp(request.headers.get('x-forwarded-for'));
  try {
    const rateLimit = await aiGenerateLimiter.limit(ip);
    if (!rateLimit.success) {
      const headers = getRateLimitHeaders(rateLimit);
      return NextResponse.json(
        { error: 'AI tavsifi yaratish limiti tugadi. Ertaga qayta urinib ko‘ring.' },
        { status: 429, headers },
      );
    }
  } catch (error) {
    console.error('AI rate limit check failed:', error);
    return NextResponse.json(
      { error: 'Rate limiting xizmati vaqtincha ishlamayapti' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Noto‘g‘ri so‘rov ma’lumoti' }, { status: 400 });
  }

  const parsed = generateDescriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Kerakli maydonlarni to‘ldiring' }, { status: 400 });
  }

  try {
    const description = await generateListingDescription(parsed.data);
    return NextResponse.json({ description });
  } catch (error) {
    console.error('AI description API failed:', error);
    return NextResponse.json(
      { error: 'Tavsif yaratishda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.' },
      { status: 502 },
    );
  }
}
