import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateListingData } from '@/lib/ai';
import {
  aiGenerateLimiter,
  getClientIp,
  getRateLimitHeaders,
  isRateLimitConfigured,
} from '@/lib/ratelimit';
import { isListingImageUrl } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

const smartFillSchema = z.object({
  title: z.string().trim().max(120).default(''),
  region: z.string().trim().max(50).default(''),
  district: z.string().trim().max(50).default(''),
  rooms: z.number().int().min(0).max(20).optional(),
  area: z.number().positive().max(100_000).optional(),
  price: z.number().min(0).max(1_000_000_000_000).default(0),
  currency: z.enum(['USD', 'UZS']).default('UZS'),
  category: z.string().min(1).max(50),
  type: z.string().min(1).max(50),
  imageUrl: z.string().url(),
});

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request: NextRequest) {
  if (!isRateLimitConfigured) {
    return NextResponse.json({ error: 'Rate limiting xizmati sozlanmagan' }, { status: 503 });
  }

  try {
    const limit = await aiGenerateLimiter.limit(getClientIp(request.headers.get('x-forwarded-for')));
    if (!limit.success) {
      return NextResponse.json(
        { error: 'AI limiti tugadi. Keyinroq qayta urinib ko‘ring.' },
        { status: 429, headers: getRateLimitHeaders(limit) },
      );
    }
  } catch (error) {
    console.error('Smart fill rate limit check failed:', error);
    return NextResponse.json({ error: 'AI xizmati vaqtincha ishlamayapti' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Noto‘g‘ri so‘rov ma’lumoti' }, { status: 400 });
  }

  const parsed = smartFillSchema.safeParse(body);
  if (!parsed.success || !isListingImageUrl(parsed.data.imageUrl)) {
    return NextResponse.json({ error: 'So‘rov yoki rasm manzili noto‘g‘ri' }, { status: 400 });
  }

  try {
    const imageResponse = await fetch(parsed.data.imageUrl, {
      signal: AbortSignal.timeout(8000),
    });
    const contentType = imageResponse.headers.get('content-type')?.split(';')[0] ?? '';
    const contentLength = Number(imageResponse.headers.get('content-length') ?? 0);
    if (!imageResponse.ok || !ALLOWED_IMAGE_TYPES.has(contentType) || contentLength > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'AI tahlili uchun rasm mos emas' }, { status: 400 });
    }

    const reader = imageResponse.body?.getReader();
    if (!reader) {
      return NextResponse.json({ error: 'Rasmni yuklab bo‘lmadi' }, { status: 400 });
    }
    const imageChunks: Uint8Array[] = [];
    let imageSize = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      imageSize += chunk.value.byteLength;
      if (imageSize > MAX_IMAGE_BYTES) {
        await reader.cancel();
        return NextResponse.json(
          { error: 'Rasm hajmi 5 MB dan oshmasligi kerak' },
          { status: 400 },
        );
      }
      imageChunks.push(chunk.value);
    }
    if (imageSize === 0) {
      return NextResponse.json({ error: 'Rasm hajmi 5 MB dan oshmasligi kerak' }, { status: 400 });
    }
    const imageBytes = Buffer.concat(imageChunks.map((chunk) => Buffer.from(chunk)));

    const data = await generateListingData(parsed.data, {
      mimeType: contentType,
      data: imageBytes.toString('base64'),
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Smart fill API failed:', error);
    return NextResponse.json({ error: 'AI orqali to‘ldirishda xatolik yuz berdi' }, { status: 502 });
  }
}
