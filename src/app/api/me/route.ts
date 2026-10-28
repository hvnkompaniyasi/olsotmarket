import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { Prisma } from "@prisma/client"
import * as Sentry from "@sentry/nextjs" // Sentry qo'shildi
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"
import { UpdateProfileSchema } from "@/lib/schemas"

export const dynamic = "force-dynamic"

// 1. GET: Foydalanuvchi ma'lumotlarini olish
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya kerak" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        name: true, 
        phone: true, 
        email: true, 
        createdAt: true 
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    Sentry.captureException(error)
    console.error("GET /api/me xatosi:", error)
    return NextResponse.json({ error: "Ma'lumotlarni yuklab bo'lmadi" }, { status: 500 })
  }
}

// 2. PATCH: Foydalanuvchi ma'lumotlarini yangilash
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya kerak" }, { status: 401 })
    }

    // Xavfsiz JSON parse qilish
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Noto'g'ri JSON ma'lumot yuborildi" }, { status: 400 })
    }

    // Zod orqali validatsiya
    const validation = UpdateProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Ma'lumotlar noto'g'ri" }, 
        { status: 400 }
      )
    }
    const { name, phone } = validation.data

    const data: Prisma.UserUpdateInput = {}
    if (name !== undefined) data.name = name ? String(name) : null
    if (phone !== undefined) data.phone = String(phone)

    // Agar hech narsa o'zgarmagan bo'lsa, keraksiz so'rov yubormaymiz
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: "O'zgartirish uchun ma'lumot yo'q" }, { status: 400 })
    }

    const user = await prisma.user.update({ 
      where: { id: session.user.id }, 
      data 
    })
    
    return NextResponse.json({ user })
    
  } catch (error) {
    Sentry.captureException(error)
    console.error("PATCH /api/me xatosi:", error)

    // 3. Prisma'ning xatosini aniq ajratish (Unique constraint)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[])?.join(", ") || "ma'lumot"
        return NextResponse.json(
          { error: `Bu ${target === "phone" ? "telefon raqam" : target} allaqachon ro'yxatdan o'tgan` }, 
          { status: 409 } // 409 Conflict
        )
      }
    }

    return NextResponse.json(
      { error: "Serverda kutilmagan xatolik yuz berdi. Keyinroq urinib ko'ring." }, 
      { status: 500 }
    )
  }
}