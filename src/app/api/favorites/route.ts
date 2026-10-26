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
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId: listingId,
        },
      },
    })

    if (existingFavorite) {
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

// Brauzerdagi eski komponentlar xato bermasligi uchun DELETE metodini qaytaramiz
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Auth kerak" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const listingId = searchParams.get("listingId")
  if (!listingId) {
    return NextResponse.json({ error: "listingId kerak" }, { status: 400 })
  }

  // deleteMany ishlatsak, agar yozuv bo'lmasa ham xato bermaydi
  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, listingId },
  })

  return NextResponse.json({ success: true })
}