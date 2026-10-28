import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import * as Sentry from "@sentry/nextjs" // Sentry qo'shildi
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"
import { ChangePasswordSchema } from "@/lib/schemas"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    // 1. Sessiyani tekshirish
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 })
    }

    // 2. Foydalanuvchini bazadan tekshirish
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }
    
    // Agar foydalanuvchi OTP orqali kirgan bo'lsa va paroli bo'lmasa
    if (!user.password) {
      return NextResponse.json(
        { error: "Sizning akkauntingizda parol o'rnatilmagan. Parol o'rnatish uchun qo'llab-quvvatlash xizmatiga murojaat qiling." }, 
        { status: 400 }
      )
    }

    // 3. Xavfsiz JSON parse qilish
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Noto'g'ri JSON ma'lumot yuborildi" }, { status: 400 })
    }

    // 4. Zod orqali validatsiya qilish
    const validation = ChangePasswordSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Ma'lumotlar noto'g'ri" },
        { status: 400 }
      )
    }
    const { currentPassword, newPassword } = validation.data

    // 5. Hozirgi parolni tekshirish
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Hozirgi parol noto'g'ri" }, { status: 403 })
    }

    // 6. Yangi parolni xeshlash va bazaga yozish
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ 
      ok: true, 
      message: "Parolingiz muvaffaqiyatli o'zgartirildi" 
    })
    
  } catch (error) {
    // 7. Kutilmagan xatoliklarni Sentry'ga yuborish
    Sentry.captureException(error)
    console.error("POST /api/me/password xatosi:", error)
    
    return NextResponse.json(
      { error: "Serverda kutilmagan xatolik yuz berdi. Keyinroq qayta urinib ko'ring." }, 
      { status: 500 }
    )
  }
}