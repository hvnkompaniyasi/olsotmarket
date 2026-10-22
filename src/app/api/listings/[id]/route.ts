import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"
import { deleteListingImage, listingImagePathFromUrl } from "@/lib/supabaseClient"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: params.id } })
    if (!listing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 })
    return NextResponse.json({ listing })
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Avval tizimga kiring" }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { userId: true, images: true },
    })
    if (!listing) return NextResponse.json({ error: "E'lon topilmadi" }, { status: 404 })
    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
    }

    await prisma.listing.delete({ where: { id: params.id } })

    const paths = listing.images
      .map((url) => listingImagePathFromUrl(url))
      .filter((path): path is string => Boolean(path))
    await Promise.allSettled(paths.map((path) => deleteListingImage(path)))

    revalidatePath("/my-listings")
    revalidatePath("/listings")
    revalidatePath(`/listing/${params.id}`)

    return NextResponse.json({ success: true, data: { id: params.id } })
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error)
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 })
  }
}
