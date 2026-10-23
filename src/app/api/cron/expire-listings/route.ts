import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/auth"
import { createNotification } from "@/lib/notify"
import { invalidateRedisCache } from "@/lib/redis"

export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Vercel cron secret himoyasi
  const auth = req.headers.get("authorization")
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 })
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const expired = await prisma.listing.findMany({
    where: { status: "ACTIVE", createdAt: { lt: thirtyDaysAgo } },
    select: { id: true, userId: true, title: true },
  })

  if (expired.length > 0) {
    await prisma.listing.updateMany({
      where: { id: { in: expired.map((l) => l.id) } },
      data: { status: "EXPIRED" },
    })
    await invalidateRedisCache("listings:v1:*")

    // Har bir egasiga bildirishnoma
    for (const l of expired) {
      await createNotification(
        l.userId,
        "LISTING_EXPIRED",
        "⏰ E'lon muddati tugadi",
        `"${(l.title || "E'lon").slice(0, 40)}" 30 kunlik muddati tugadi. Yangilash uchun profilga kiring.`,
        "/my-listings"
      )
    }
  }

  return NextResponse.json({ ok: true, expired: expired.length })
}
