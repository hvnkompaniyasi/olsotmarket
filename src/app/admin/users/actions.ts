"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Role } from "@prisma/client"
import { logAdminAction } from "@/lib/audit"

export async function deleteUserAction(userId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Ruxsat berilmagan")

  // SuperAdminni o'chirishni taqiqlash
  const firstAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } })
  if (userId === firstAdmin?.id) throw new Error("SuperAdminni o'chirib bo'lmaydi")

  await prisma.user.delete({ where: { id: userId } })
  await logAdminAction({ adminId: session.user.id, action: "DELETE_USER", targetId: userId })
  
  revalidatePath("/admin/users")
  redirect("/admin/users")
}

export async function updateUserAction(userId: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") throw new Error("Ruxsat berilmagan")

  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const role = formData.get("role") as Role

  await prisma.user.update({
    where: { id: userId },
    data: { name, phone, role }
  })

  await logAdminAction({ adminId: session.user.id, action: "UPDATE_USER", targetId: userId })
  revalidatePath("/admin/users")
  revalidatePath(`/admin/users/${userId}`)
}
