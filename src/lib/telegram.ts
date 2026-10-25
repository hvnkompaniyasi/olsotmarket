type ListingTelegramDetails = {
  id: string;
  title: string;
  price: number;
  region: string;
  district: string;
  images: string[];
};

type TelegramApiResponse = {
  ok: boolean;
  description?: string;
};

export async function sendListingToTelegram(listing: ListingTelegramDetails): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured');
  }

  const text = [
    `Yangi e'lon: ${listing.title}`,
    `Narxi: ${new Intl.NumberFormat('uz-UZ').format(listing.price)} so'm`,
    `Manzil: ${listing.region}, ${listing.district}`,
  ].join('\n');
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '✅ Tasdiqlash', callback_data: `approve_${listing.id}` },
        { text: '❌ Rad etish', callback_data: `reject_${listing.id}` },
      ],
    ],
  };
  const method = listing.images[0] ? 'sendPhoto' : 'sendMessage';
  const body =
    method === 'sendPhoto'
      ? {
          chat_id: chatId,
          photo: listing.images[0],
          caption: text,
          reply_markup: replyMarkup,
        }
      : { chat_id: chatId, text, reply_markup: replyMarkup };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as TelegramApiResponse;

    if (!response.ok || !result.ok) {
      throw new Error(result.description ?? `Telegram API returned ${response.status}`);
    }
  } catch (error) {
    console.error('Unable to send listing to Telegram:', error);
    throw error;
  }
}
