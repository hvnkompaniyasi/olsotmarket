import { NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs" // Sentry qo'shildi
import { prisma } from "@/lib/prisma" // Odatiy holatda lib/prisma dan import qilinadi (agar loyihada auth.ts da bo'lsa, o'sha holicha qoldiring)
import { ListingStatus } from "@prisma/client"
import { formatPrice } from "@/lib/format" // Narxni formatlash uchun

export const dynamic = "force-dynamic"

// Qaytariladigan ma'lumotlar tipi (Frontend uchun qulaylik)
type Suggestion = {
  type: "region" | "listing"
  label: string
  href: string
  meta?: string
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim()
  
  // Minimum 2 ta belgi kiritilmaguncha qidiruv ishlamaydi (yuklamani tejash uchun)
  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  const cond = { contains: q, mode: "insensitive" as const }

  try {
    const [listings, regions] = await Promise.all([
      // 1. E'lonlar bo'yicha qidiruv
      prisma.listing.findMany({
        where: {
          status: ListingStatus.ACTIVE,
          OR: [
            { title: cond }, 
            { district: cond }, 
            { address: cond }
          ],
        },
        select: { 
          id: true, 
          title: true, 
          region: true, 
          price: true,
          currency: true // XATO TUZATILDI: Valyuta qo'shildi
        },
        take: 5, // Maksimal 5 ta e'lon
      }),
      
      // 2. Viloyatlar bo'yicha qidiruv
      prisma.listing.findMany({
        where: { 
          status: ListingStatus.ACTIVE, 
          region: cond 
        },
        select: { region: true },
        distinct: ["region"],
        take: 3, // Maksimal 3 ta viloyat
      }),
    ])

    // Natijalarni birlashtirish
    const suggestions: Suggestion[] = [
      ...regions.map((r) => ({
        type: "region" as const,
        label: r.region,
        href: `/listings?region=${encodeURIComponent(r.region)}`,
      })),
      ...listings.map((l) => ({
        type: "listing" as const,
        label: l.title || "Sarlavhasiz e'lon",
        href: `/listing/${encodeURIComponent(l.id)}`,
        // XATO TUZATILDI: formatPrice ishlatildi
        meta: `${l.region} • ${formatPrice(l.price, l.currency || "UZS")}`,
      })),
    ]

    return NextResponse.json({ suggestions })
    
  } catch (error) {
    // Xatoni Sentry'ga yuboramiz
    Sentry.captureException(error)
    console.error("Qidiruv takliflarida xatolik:", error)
    
    return NextResponse.json(
      { error: "Qidiruv takliflarini yuklab bo'lmadi", suggestions: [] }, 
      { status: 500 }
    )
  }
}