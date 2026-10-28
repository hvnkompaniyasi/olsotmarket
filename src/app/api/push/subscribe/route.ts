import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import * as Sentry from "@sentry/nextjs" // Sentry qo'shildi
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = "force-dynamic"

// 1. Zod Sxemalari (Kodni toza saqlash uchun)
const PushSubSchema = z.object({
  endpoint: z.string().min(10, "Endpoint noto'g'ri"),
  keys: z.object({
    p256dh: z.string().min(10, "p256dh kaliti noto'g'ri"),
    auth: z.string().min(10, "auth kaliti noto'g'ri"),
  }),
})

const PushDeleteSchema = z.object({
  endpoint: z.string().min(10, "Endpoint noto'g'ri"),
})

// 2. Xavfsiz JSON parse qilish yordamchisi
async function safeJson(req: NextRequest): Promise<unknown | null> {
  try {
    return await req.json()
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya kerak" }, { status: 401 })
  }

  // JSON parse qilish
  const body = await safeJson(req)
  if (!body) {
    return NextResponse.json({ error: "Noto'g'ri JSON ma'lumot" }, { status: 400 })
  }

  // Validatsiya
  const validation = PushSubSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0]?.message || "Noto'g'ri ma'lumot" },
      { status: 400 }
    )
  }
  const data = validation.data

  try {
    // Bazaga yozish yoki yangilash
    await prisma.pushSubscription.upsert({
      where: { endpoint: data.endpoint },
      update: { 
        userId: session.user.id, 
        p256dh: data.keys.p256dh, 
        auth: data.keys.auth 
      },
      create: {
        userId: session.user.id,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    // Xatoni Sentry'ga yuborish
    Sentry.captureException(error)
    console.error("Push subscribe xatosi:", error)
    return NextResponse.json(
      { error: "Obunani saqlashda xatolik yuz berdi" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Avtorizatsiya kerak" }, { status: 401 })
  }

  const body = await safeJson(req)
  if (!body) {
    return NextResponse.json({ error: "Noto'g'ri JSON ma'lumot" }, { status: 400 })
  }

  const validation = PushDeleteSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.issues[0]?.message || "Endpoint kiritilmadi" },
      { status: 400 }
    )
  }

  try {
    await prisma.pushSubscription.deleteMany({
      where: { 
        endpoint: validation.data.endpoint, 
        userId: session.user.id 
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    Sentry.captureException(error)
    console.error("Push unsubscribe xatosi:", error)
    return NextResponse.json(
      { error: "Obunani o'chirishda xatolik yuz berdi" }, 
      { status: 500 }
    )
  }
}