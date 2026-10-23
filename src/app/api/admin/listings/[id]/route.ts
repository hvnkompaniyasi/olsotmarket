import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { invalidateRedisCache } from "@/lib/redis"

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "vip"]),
})

async function isAdmin() {
  const session = await getServerSession(authOptions)
  return Boolean(
    session?.user?.id &&
    (session.user.role === "ADMIN" || session.user.role === "SUPERADMIN")
  )
}

function revalidateListing(id: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/listings")
  revalidatePath("/listings")
  revalidatePath(`/listing/${id}`)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: "Ruxsat yo'q" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Noto'g'ri JSON ma'lumot" }, { status: 400 })
  }
  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Noto'g'ri amal" }, { status: 400 })
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  })
  if (!listing) {
    return NextResponse.json({ success: false, error: "E'lon topilmadi" }, { status: 404 })
  }

  if (parsed.data.action === "vip") {
    await prisma.listing.update({ where: { id: params.id }, data: { isPremium: true } })
  } else {
    if (listing.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "E'lon allaqachon ko'rib chiqilgan" }, { status: 409 })
    }
    await prisma.listing.update({
      where: { id: params.id },
      data: { status: parsed.data.action === "approve" ? "ACTIVE" : "REJECTED" },
    })
  }

  await invalidateRedisCache("listings:v1:*")
  revalidateListing(params.id)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ success: false, error: "Ruxsat yo'q" }, { status: 403 })
  }

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { id: true },
  })
  if (!listing) {
    return NextResponse.json({ success: false, error: "E'lon topilmadi" }, { status: 404 })
  }
  await prisma.listing.delete({ where: { id: params.id } })
  await invalidateRedisCache("listings:v1:*")
  revalidateListing(params.id)
  return NextResponse.json({ success: true })
}
