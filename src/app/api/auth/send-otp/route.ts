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

    const code = String(randomInt(0, 10_000)).padStart(4, "0")
    await redis.set(`otp:${phone}`, code, "EX", 300)
    console.log(`Test OTP for ${phone}: ${code}`)

    return NextResponse.json({
      success: true,
      devCode: code,
      message: "Test rejimi: Kod ekranga chiqarildi",
    })
  } catch (error) {
    console.error("OTP yuborish xatosi:", error)
    return NextResponse.json({ error: "OTP xizmati hozircha ishlamayapti" }, { status: 503 })
  }
}