"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { logAdminAction } from "@/lib/audit"

export async function updateListingStatus(listingId: string, newStatus: "ACTIVE" | "REJECTED") {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Ruxsat berilmagan")
  }

  try {
    await prisma.listing.update({
      where: { id: listingId },
      data: { status: newStatus },
    })

    await logAdminAction({
      adminId: session.user.id,
      action: newStatus === "ACTIVE" ? "APPROVE_LISTING" : "REJECT_LISTING",
      targetId: listingId,
    })

    revalidatePath("/admin/listings")
    revalidatePath(`/admin/listings/${listingId}`)
    
    redirect("/admin/listings")
  } catch (error) {
    console.error("Moderatsiya xatosi:", error)
    throw new Error("E'lonni yangilashda xatolik yuz berdi")
  }
}
