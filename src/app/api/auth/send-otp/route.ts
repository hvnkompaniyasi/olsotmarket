import { randomInt } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { getRedisClient } from "@/lib/redis"
import { normalizeUzbekPhone } from "@/lib/phone"

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

    // --- TEST REJIMI: SMS yuborilmaydi, faqat konsolga chiqariladi ---
    console.log(`[TEST REJIMI] Telefon: ${phone}, Kod: ${code}`)

    // Muvaffaqiyatli javob (kodni frontendga ham qaytaramiz)
    return NextResponse.json({
      success: true,
      message: "Tasdiqlash kodi yaratildi (test rejimi).",
      devCode: code // Frontendda ko'rsatish uchun
    })
  } catch (error) {
    console.error("OTP yuborish xatosi:", error)
    return NextResponse.json({ error: "OTP xizmati hozircha ishlamayapti" }, { status: 503 })
  }
}