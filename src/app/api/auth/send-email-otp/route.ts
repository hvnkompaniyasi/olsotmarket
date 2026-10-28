import { randomInt } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { sendEmailOtpSchema } from "@/lib/schemas"
import { sendOtpEmail } from "@/lib/email"
import { getRedisClient } from "@/lib/redis"

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Email noto'g'ri" }, { status: 400 })
  }

  const parsed = sendEmailOtpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Email noto'g'ri" }, { status: 400 })
  }

  const email = parsed.data.email
  const redis = getRedisClient()
  if (!redis) {
    return NextResponse.json({ error: "OTP xizmati hozircha ishlamayapti" }, { status: 503 })
  }

  const key = `otp:email:${email}`
  try {
    if (redis.status === "wait") await redis.connect()
    if (redis.status !== "ready") throw new Error("Redis is not ready")

    const code = String(randomInt(0, 10_000)).padStart(4, "0")
    await redis.set(key, code, "EX", 300)
    try {
      await sendOtpEmail(email, code)
    } catch (error) {
      await redis.del(key)
      throw error
    }

    return NextResponse.json({
      success: true,
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    })
  } catch (error) {
    console.error("Email OTP yuborish xatosi:", error)
    return NextResponse.json({ error: "OTP xizmati hozircha ishlamayapti" }, { status: 503 })
  }
}