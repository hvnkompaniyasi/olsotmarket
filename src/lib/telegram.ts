import { DEAL_TYPES, PROPERTY_CATEGORIES } from "@/lib/locations";

type ListingTelegramDetails = {
  id: string;
  slug: string | null;
  title: string;
  description: string;
  type: string;
  category: string;
  price: number;
  currency: string;
  region: string;
  district: string;
  address: string;
  rooms: number | null;
  area: number | null;
  floor: number | null;
  totalFloors: number | null;
  renovation: string | null;
  livingArea: number | null;
  landArea: number | null;
  purpose: string | null;
  buildingType: string | null;
  electricityPower: number | null;
  parking: boolean | null;
  entrance: string | null;
  bathroom: number | null;
  elevator: boolean | null;
  furniture: boolean | null;
  deposit: number | null;
  utilitiesCondition: string | null;
  hasGas: boolean;
  hasWater: boolean;
  hasElectricity: boolean;
  hasSewage: boolean | null;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  user: {
    name: string | null;
    phone: string | null;
  };
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPrice(price: number, currency: string): string {
  const formatted = new Intl.NumberFormat('ru-RU').format(price);
  return `${formatted} ${escapeHtml(currency)}`;
}

function buildListingMessage(listing: ListingTelegramDetails): string {
  const listingUrl = `https://olsotmarket.uz/listing/${encodeURIComponent(
    listing.slug ?? listing.id,
  )}`;
  const mapUrl =
    listing.latitude !== null && listing.longitude !== null
      ? `https://maps.google.com/?q=${listing.latitude},${listing.longitude}`
      : null;
  const description = listing.description.trim();
  const shortenedDescription =
    description.length > 200 ? `${description.slice(0, 197).trimEnd()}...` : description;
  const dealName = DEAL_TYPES.find((deal) => deal.id === listing.type)?.name ?? listing.type;
  const categoryName =
    PROPERTY_CATEGORIES.find((category) => category.id === listing.category)?.name ?? listing.category;
  const roomsAreaFloor = [
    listing.rooms === null ? null : `<b>Xonalar:</b> ${listing.rooms} xona`,
    listing.area === null ? null : `<b>Maydon:</b> ${listing.area} m²`,
    listing.floor === null
      ? null
      : `<b>Qavat:</b> ${listing.floor}/${listing.totalFloors ?? '?'}`,
  ].filter((value): value is string => value !== null);
  const additionalDetails = [
    listing.livingArea === null ? null : `<b>Yashash maydoni:</b> ${listing.livingArea} m²`,
    listing.landArea === null ? null : `<b>Yer maydoni:</b> ${listing.landArea} sotix`,
    listing.bathroom === null ? null : `<b>Sanuzel:</b> ${listing.bathroom} ta`,
    listing.purpose ? `<b>Maqsadi:</b> ${escapeHtml(listing.purpose)}` : null,
    listing.buildingType ? `<b>Bino turi:</b> ${escapeHtml(listing.buildingType)}` : null,
    listing.electricityPower === null ? null : `<b>Elektr quvvati:</b> ${listing.electricityPower} kW`,
    listing.entrance ? `<b>Kirish joyi:</b> ${escapeHtml(listing.entrance)}` : null,
    listing.parking === null ? null : `<b>Avtoturargoh:</b> ${listing.parking ? "Bor" : "Yo'q"}`,
    listing.elevator === null ? null : `<b>Lift:</b> ${listing.elevator ? "Bor" : "Yo'q"}`,
    listing.furniture === null ? null : `<b>Mebel:</b> ${listing.furniture ? "Bor" : "Yo'q"}`,
    listing.deposit === null ? null : `<b>Depozit:</b> ${formatPrice(listing.deposit, listing.currency)}`,
    listing.utilitiesCondition
      ? `<b>Kommunal to'lovlar sharti:</b> ${escapeHtml(listing.utilitiesCondition)}`
      : null,
  ].filter((value): value is string => value !== null);

  return [
    `🏠 <b>Sarlavha:</b> ${escapeHtml(listing.title)}`,
    `<b>Bitim:</b> ${escapeHtml(dealName)}`,
    `<b>Kategoriya:</b> ${escapeHtml(categoryName)}`,
    `<b>Narx:</b> ${formatPrice(listing.price, listing.currency)}`,
    `<b>Hudud:</b> ${escapeHtml(listing.region)}, ${escapeHtml(listing.district)}`,
    `<b>Manzil:</b> ${escapeHtml(listing.address)}`,
    ...(roomsAreaFloor.length ? [roomsAreaFloor.join(' | ')] : []),
    ...(listing.renovation
      ? [`<b>Ta'mir:</b> ${escapeHtml(listing.renovation)}`]
      : []),
    ...additionalDetails,
    `<b>Kommunal:</b> Gaz: ${listing.hasGas ? 'Ha' : "Yo'q"} | Suv: ${
      listing.hasWater ? 'Ha' : "Yo'q"
    } | Svet: ${listing.hasElectricity ? 'Ha' : "Yo'q"}${
      listing.hasSewage === null ? "" : ` | Kanalizatsiya: ${listing.hasSewage ? "Ha" : "Yo'q"}`
    }`,
    ...(shortenedDescription
      ? [`<b>Tavsif:</b> ${escapeHtml(shortenedDescription)}`]
      : []),
    `<b>Muallif:</b> ${escapeHtml(listing.user.name ?? 'Noma’lum')} (${escapeHtml(
      listing.user.phone ?? 'Telefon ko‘rsatilmagan',
    )})`,
    `<b>Saytda ko'rish:</b> <a href="${listingUrl}">Havola</a>`,
    ...(mapUrl ? [`<b>Xarita:</b> <a href="${mapUrl}">Xaritada ko'rish</a>`] : []),
  ].join('\n');
}

async function callTelegramApi(
  token: string,
  method: string,
  body: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result: unknown = await response.json();

  if (
    !response.ok ||
    typeof result !== 'object' ||
    result === null ||
    !('ok' in result) ||
    result.ok !== true
  ) {
    const description =
      typeof result === 'object' &&
      result !== null &&
      'description' in result &&
      typeof result.description === 'string'
        ? result.description
        : `Telegram API returned ${response.status}`;
    throw new Error(description);
  }
}

export async function sendListingToTelegram(listing: ListingTelegramDetails): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be configured');
  }

  const text = buildListingMessage(listing);
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '✅ Tasdiqlash', callback_data: `approve_${listing.id}` },
        { text: '❌ Rad etish', callback_data: `reject_${listing.id}` },
      ],
    ],
  };
  const images = listing.images.slice(0, 10);

  try {
    if (images.length > 1) {
      await callTelegramApi(token, 'sendMediaGroup', {
        chat_id: chatId,
        media: images.map((image) => ({ type: 'photo', media: image })),
      });
      await callTelegramApi(token, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      });
      return;
    }

    if (images.length === 1) {
      await callTelegramApi(token, 'sendPhoto', {
        chat_id: chatId,
        photo: images[0],
      });
    }
    await callTelegramApi(token, 'sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup,
    });
  } catch (error) {
    console.error('Unable to send listing to Telegram:', error);
    throw error;
  }
}
