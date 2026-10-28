import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs'; // Sentry qo'shildi

export const dynamic = 'force-dynamic';

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
    caption?: string; // Rasmli xabarlar uchun qo'shildi
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readCallbackQuery(body: unknown): TelegramCallbackQuery | null {
  if (!isRecord(body) || !isRecord(body.callback_query)) return null;

  const callback = body.callback_query;
  if (typeof callback.id !== 'string') return null;

  let message: TelegramCallbackQuery['message'];
  if (isRecord(callback.message) && isRecord(callback.message.chat)) {
    const messageId = callback.message.message_id;
    const chatId = callback.message.chat.id;
    if (typeof messageId === 'number' && typeof chatId === 'number') {
      message = {
        message_id: messageId,
        chat: { id: chatId },
        ...(typeof callback.message.text === 'string' ? { text: callback.message.text } : {}),
        ...(typeof callback.message.caption === 'string' ? { caption: callback.message.caption } : {}),
      };
    }
  }

  return {
    id: callback.id,
    ...(typeof callback.data === 'string' ? { data: callback.data } : {}),
    ...(message ? { message } : {}),
  };
}

async function callTelegramApi(
  token: string,
  method: string,
  body: Record<string, unknown>, // Tip kengaytirildi
): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json();

  if (!response.ok || !isRecord(result) || result.ok !== true) {
    const description =
      isRecord(result) && typeof result.description === 'string'
        ? result.description
        : `Telegram API returned ${response.status}`;
    throw new Error(description);
  }
}

async function answerCallback(
  token: string,
  callbackId: string,
  text?: string,
): Promise<void> {
  await callTelegramApi(token, 'answerCallbackQuery', {
    callback_query_id: callbackId,
    ...(text ? { text } : {}),
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.TELEGRAM_SECRET_TOKEN;
  const providedSecret = request.headers.get('x-telegram-bot-api-secret-token');

  // XAVFSIZLIK TUZATILDI: Endi header umuman bo'lmasa ham xato beradi (agar secret sozlangan bo'lsa)
  if (secret && providedSecret !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('Telegram webhook received without TELEGRAM_BOT_TOKEN configured');
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const callback = readCallbackQuery(body);
  if (!callback) return NextResponse.json({ ok: true });

  const match = /^(approve|reject)_([\w-]{1,128})$/.exec(callback.data ?? '');
  if (!match) {
    try {
      await answerCallback(token, callback.id, 'Noma’lum amal');
    } catch (error) {
      console.error('Unable to answer Telegram callback:', error);
      Sentry.captureException(error);
      return NextResponse.json({ error: 'Telegram callback failed' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  const [, decision, listingId] = match;
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true },
  });

  if (!admin) {
    try {
      await answerCallback(token, callback.id, 'Admin topilmadi');
    } catch (error) {
      console.error('Unable to answer Telegram callback:', error);
      Sentry.captureException(error);
    }
    return NextResponse.json({ error: 'Admin not found' }, { status: 503 });
  }

  const approved = decision === 'approve';
  const action = approved ? 'APPROVE_LISTING' : 'REJECT_LISTING';
  const newStatus = approved ? 'ACTIVE' : 'REJECTED';

  try {
    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.listing.updateMany({
        where: { id: listingId, status: 'PENDING' },
        data: { status: newStatus },
      });

      if (result.count > 0) {
        await transaction.adminLog.create({
          data: {
            adminId: admin.id,
            action,
            targetId: listingId,
          },
        });
      }

      return result.count > 0;
    });

    const callbackMessage = updated
      ? approved
        ? `✅ Tasdiqlandi (${admin.name ?? 'Admin'})`
        : '❌ Rad etildi'
      : 'E’lon avval ko’rib chiqilgan yoki topilmadi';

    // XATO TUZATILDI: Rasmli xabar (caption) yoki matnli xabar (text) ekanligini tekshirish
    if (callback.message) {
      const isCaption = Boolean(callback.message.caption);
      const method = isCaption ? 'editMessageCaption' : 'editMessageText';
      const textField = isCaption ? 'caption' : 'text';

      await callTelegramApi(token, method, {
        chat_id: callback.message.chat.id,
        message_id: callback.message.message_id,
        [textField]: callbackMessage,
      });
    }

    await answerCallback(token, callback.id, callbackMessage);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram moderation webhook failed:', error);
    Sentry.captureException(error); // Xatoni Sentry'ga yuboramiz
    
    try {
      await answerCallback(token, callback.id, 'Amalni bajarishda xatolik yuz berdi');
    } catch (callbackError) {
      console.error('Unable to answer Telegram callback:', callbackError);
      Sentry.captureException(callbackError);
    }
    return NextResponse.json({ error: 'Moderation action failed' }, { status: 500 });
  }
}