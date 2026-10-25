import { GoogleGenAI } from '@google/genai';

export type ListingDescriptionParams = {
  title: string;
  region: string;
  district: string;
  rooms?: number;
  area?: number;
  price: number;
  currency?: 'USD' | 'UZS';
  category: string;
  type: string;
  features?: string[];
};

export type ListingImageInput = {
  mimeType: string;
  data: string;
};

export type ListingGeneratedData = {
  title: string;
  description: string;
  rooms?: number;
  renovation?: string;
};

function formatPrice(price: number, currency: 'USD' | 'UZS' = 'UZS'): string {
  const formatted = new Intl.NumberFormat('uz-UZ').format(price);
  return currency === 'USD' ? `$${formatted}` : `${formatted} so'm`;
}

export async function generateListingDescription(
  params: ListingDescriptionParams,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const details = [
    `Sarlavha: ${params.title}`,
    `Hudud: ${params.region}, ${params.district}`,
    `Narx: ${formatPrice(params.price, params.currency)}`,
    `Kategoriya: ${params.category}`,
    `Bitim turi: ${params.type}`,
    ...(params.rooms === undefined ? [] : [`Xonalar soni: ${params.rooms}`]),
    ...(params.area === undefined ? [] : [`Maydon: ${params.area} m²`]),
    ...(params.features?.length ? [`Afzalliklar: ${params.features.join(', ')}`] : []),
  ].join('\n');

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        'Ko‘chmas mulk e’loni uchun o‘zbek tilida professional va jozibali tavsif yoz.',
        'Tavsif 3–5 jumladan iborat bo‘lsin. Narxni va ko‘rsatilgan afzalliklarni ta’kidla.',
        'Faqat berilgan ma’lumotlardan foydalan; mavjud bo‘lmagan xususiyatlarni uydirma.',
        'Javobda faqat e’lon tavsifini qaytar.',
        '',
        details,
      ].join('\n'),
    });

    const description = response.text?.trim();
    if (!description) {
      throw new Error('Gemini returned an empty listing description');
    }

    return description;
  } catch (error) {
    console.error('Listing description generation failed:', error);
    throw new Error('AI tavsifini yaratib bo‘lmadi');
  }
}

export async function generateListingData(
  params: ListingDescriptionParams,
  image?: ListingImageInput,
): Promise<ListingGeneratedData> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenAI({ apiKey });
  const details = [
    `Mavjud sarlavha: ${params.title || 'kiritilmagan'}`,
    `Hudud: ${params.region || 'ko‘rsatilmagan'}, ${params.district || 'ko‘rsatilmagan'}`,
    `Narx: ${formatPrice(params.price, params.currency)}`,
    `Kategoriya: ${params.category}`,
    `Bitim turi: ${params.type}`,
    ...(params.rooms === undefined ? [] : [`Xonalar soni: ${params.rooms}`]),
    ...(params.area === undefined ? [] : [`Maydon: ${params.area} m²`]),
    ...(params.features?.length ? [`Afzalliklar: ${params.features.join(', ')}`] : []),
  ].join('\n');

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: [
                'Siz O‘zbekiston ko‘chmas mulk bozorini yaxshi biladigan professional e’lon muharririsiz.',
                'Tabiiy, ravon va professional o‘zbek tilida yozing; sarlavha qisqa va qidiruvga mos bo‘lsin.',
                'Tavsif 3–5 jumla bo‘lsin, narxni valyutasi bilan to‘g‘ri ko‘rsating.',
                'Faqat tasdiqlangan ma’lumotlardan foydalaning, rasmda aniq ko‘rinmagan narsalarni to‘qimang.',
                'Rasm bo‘lsa, xonalar soni va ta’mir holatini faqat ehtiyotkor taxmin qiling; aniqlanmasa null qaytaring.',
                'Faqat JSON qaytaring: {"title":"...","description":"...","rooms":null,"renovation":null}.',
                '',
                details,
              ].join('\n'),
            },
            ...(image ? [{ inlineData: image }] : []),
          ],
        },
      ],
    });
    const text = response.text?.trim();
    if (!text) throw new Error('Gemini returned an empty listing response');

    const normalized = text.replace(/^```(?:json)?\s*|\s*```$/g, '');
    const result: unknown = JSON.parse(normalized);
    if (
      typeof result !== 'object' ||
      result === null ||
      !('title' in result) ||
      typeof result.title !== 'string' ||
      !('description' in result) ||
      typeof result.description !== 'string'
    ) {
      throw new Error('Gemini returned invalid listing data');
    }

    return {
      title: result.title.trim().slice(0, 120),
      description: result.description.trim().slice(0, 2000),
      ...('rooms' in result && typeof result.rooms === 'number' &&
      Number.isInteger(result.rooms) && result.rooms >= 0 && result.rooms <= 20
        ? { rooms: result.rooms }
        : {}),
      ...('renovation' in result && typeof result.renovation === 'string'
        ? { renovation: result.renovation.slice(0, 80) }
        : {}),
    };
  } catch (error) {
    console.error('Smart listing generation failed:', error);
    throw new Error('AI orqali e’lon ma’lumotlarini yaratib bo‘lmadi');
  }
}
