/**
 * OwnSMS (Android SMS Gateway) orqali SMS yuborish
 */
export async function sendSmsViaOwnSms(phone: string, message: string): Promise<boolean> {
  const apiUrl = process.env.OWNSMS_API_URL;
  const apiKey = process.env.OWNSMS_API_KEY;

  if (!apiUrl) {
    console.error("Xatolik: OWNSMS_API_URL .env faylida ko'rsatilmagan.");
    throw new Error("SMS xizmati sozlanmagan");
  }

  // Telefon raqamni tozalash (faqat raqamlar qoldiriladi: 998901234567)
  const cleanPhone = phone.replace(/\D/g, "");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        to: cleanPhone, // Ko'pchilik OwnSMS ilovalari 'to' yoki 'phone' qabul qiladi
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OwnSMS API xatosi (${response.status}):`, errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("OwnSMS serveriga ulanishda xatolik:", error);
    return false;
  }
}