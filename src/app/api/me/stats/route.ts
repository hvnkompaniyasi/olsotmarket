import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import * as Sentry from "@sentry/nextjs" // Sentry qo'shildi
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 1. Sessiyani tekshirish
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Statistikani ko'rish uchun avval tizimga kiring" }, 
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 2. Barcha statistikani parallel ravishda olish
    const [listingsCount, activeCount, favoritesCount] = await Promise.all([
      prisma.listing.count({ where: { userId } }),
      prisma.listing.count({ where: { userId, status: "ACTIVE" } }),
      prisma.favorite.count({ where: { userId } }),
    ])

    // 3. Muvaffaqiyatli javob qaytarish
    return NextResponse.json({ 
      listingsCount, 
      activeCount, 
      favoritesCount 
    }, {
      headers: {
        // Brauzer va CDN keshlashi uchun (chunki bu ma'lumot tez-tez o'zgarmaydi, lekin har safar yangi ma'lumot kerak)
        "Cache-Control": "no-store, must-revalidate",
      }
    })
    
  } catch (error) {
    // 4. Kutilmagan xatoliklarni Sentry'ga yuborish
    Sentry.captureException(error)
    console.error("GET /api/me/stats xatosi:", error)
    
    return NextResponse.json(
      { error: "Statistikani yuklab bo'lmadi. Keyinroq qayta urinib ko'ring." }, 
      { status: 500 }
    )
  }
}