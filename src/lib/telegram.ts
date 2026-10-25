type ListingTelegramDetails = {
  id: string;
  title: string;
  price: number;
  currency: string;
  region: string;
  district: string;
  images: string[];
  latitude: number | null;
  longitude: number | null;
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

  const price = new Intl.NumberFormat('uz-UZ').format(listing.price);
  const formattedPrice = listing.currency === 'USD' ? `$${price}` : `${price} so'm`;
  const mapUrl =
    listing.latitude !== null && listing.longitude !== null
      ? `https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`
      : null;
  const text = [
    `🏠 ${listing.title}`,
    `💰 Narxi: ${formattedPrice}`,
    `📍 Manzil: ${listing.region}, ${listing.district}`,
    ...(mapUrl ? [`🗺 Xarita: ${mapUrl}`] : []),
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
