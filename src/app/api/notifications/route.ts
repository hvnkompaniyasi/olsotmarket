import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import * as Sentry from "@sentry/nextjs" // Sentry qo'shildi
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = "force-dynamic"

const DEFAULT_LIMIT = 30

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avtorizatsiya kerak" }, { status: 401 })
    }

    // Kelajakda query orqali limitni o'zgartirish imkoniyati uchun (masalan, ?limit=10)
    const searchParams = req.nextUrl.searchParams
    const limitParam = Number(searchParams.get("limit"))
    const take = Number.isFinite(limitParam) && limitParam > 0 
      ? Math.min(limitParam, 100) // Xavfsizlik: maksimal 100 ta
      : DEFAULT_LIMIT

    // Ma'lumotlar bazasidan faqat kerakli ustunlarni olamiz
    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        link: true,
        read: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    // Xatoni Sentry'ga yuboramiz
    Sentry.captureException(error)
    console.error("GET /api/notifications xatosi:", error)
    
    return NextResponse.json(
      { error: "Bildirishnomalarni yuklab bo'lmadi" }, 
      { status: 500 }
    )
  }
}