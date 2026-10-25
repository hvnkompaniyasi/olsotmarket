import { GoogleGenAI } from '@google/genai';

export type ListingDescriptionParams = {
  title: string;
  region: string;
  district: string;
  rooms?: number;
  area?: number;
  price: number;
  category: string;
  type: string;
  features?: string[];
};

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
    `Narx: ${new Intl.NumberFormat('uz-UZ').format(params.price)} so'm`,
    `Kategoriya: ${params.category}`,
    `Bitim turi: ${params.type}`,
    ...(params.rooms === undefined ? [] : [`Xonalar soni: ${params.rooms}`]),
    ...(params.area === undefined ? [] : [`Maydon: ${params.area} m²`]),
    ...(params.features?.length ? [`Afzalliklar: ${params.features.join(', ')}`] : []),
  ].join('\n');

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
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
