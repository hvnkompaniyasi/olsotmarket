import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Auth kerak" }, { status: 401 })
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        select: {
          id: true, title: true, price: true, region: true, district: true,
          rooms: true, area: true, images: true, type: true, category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ favorites })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Auth kerak" }, { status: 401 })
  }

  const { listingId } = await req.json()
  if (!listingId) {
    return NextResponse.json({ error: "listingId kerak" }, { status: 400 })
  }

  try {
    // 1. Avval bazadan bu e'lon saqlanganmi-yo'qmi tekshiramiz
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: listingId,
        },
      },
    })

    if (existingFavorite) {
      // 2. Agar saqlangan bo'lsa, o'chiramiz (Unlike)
      await prisma.favorite.delete({
        where: {
          userId_listingId: {
            userId: session.user.id,
            listingId: listingId,
          },
        },
      })
      return NextResponse.json({ success: true, action: "removed" })
    } else {
      // 3. Agar saqlanmagan bo'lsa, qo'shamiz (Like)
      const favorite = await prisma.favorite.create({
        data: { userId: session.user.id, listingId },
      })
      return NextResponse.json({ success: true, action: "added", favorite }, { status: 201 })
    }
  } catch (error) {
    console.error("Favorites API xatosi:", error)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}