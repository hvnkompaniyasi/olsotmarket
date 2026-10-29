import { randomInt } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
import { normalizeUzbekPhone } from "@/lib/phone"
import { sendSmsViaOwnSms } from "@/lib/ownsms" // Yangi import

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Telefon raqam kerak" }, { status: 400 })
  }

  if (!body || typeof body !== "object" || !("phone" in body) || typeof body.phone !== "string") {
    return NextResponse.json({ error: "Telefon raqam kerak" }, { status: 400 })
  }

  const phone = normalizeUzbekPhone(body.phone)
  if (!phone) {
    return NextResponse.json({ error: "Telefon raqam noto'g'ri" }, { status: 400 })
  }

  const redis = getRedisClient()
  if (!redis) {
    return NextResponse.json({ error: "OTP xizmati hozircha ishlamayapti" }, { status: 503 })
  }

  try {
    if (redis.status === "wait") await redis.connect()
    if (redis.status !== "ready") throw new Error("Redis is not ready")

    // 4 xonali kod generatsiya qilamiz
    const code = String(randomInt(0, 10_000)).padStart(4, "0")
    
    // Kodni Redis'ga 5 daqiqaga (300 soniya) saqlaymiz
    await redis.set(`otp:${phone}`, code, "EX", 300)

    // --- OwnSMS orqali SMS yuborish ---
    const message = `Olsot Market: Tasdiqlash kodingiz - ${code}. Kod 5 daqiqa amal qiladi.`
    const isSent = await sendSmsViaOwnSms(phone, message)

    if (!isSent) {
      return NextResponse.json({ error: "SMS yuborishda xatolik yuz berdi. Qayta urinib ko'ring." }, { status: 500 })
    }

    // Muvaffaqiyatli javob
    return NextResponse.json({
      success: true,
      // Test rejimida kodni ham qaytaramiz (keyinchalik productionda olib tashlanadi)
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    })
  } catch (error) {
    console.error("OTP yuborish xatosi:", error)
    return NextResponse.json({ error: "OTP xizmati hozircha ishlamayapti" }, { status: 503 })
  }
}