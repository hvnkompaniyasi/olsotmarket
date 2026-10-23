import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 })
  }
  const [total, active, pending, users, messages] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.message.count(),
  ])
  return NextResponse.json({ total, active, pending, users, messages })
}
