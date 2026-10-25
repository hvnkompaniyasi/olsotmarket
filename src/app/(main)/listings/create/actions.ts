"use server"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { CreateListingSchema } from "@/lib/schemas"
import { isListingImageUrl } from "@/lib/supabaseClient"
import { sendListingToTelegram } from "@/lib/telegram"
import type { CreateListingState } from "@/lib/listing-form"
import {
  getClientIp,
  isRateLimitConfigured,
  listingCreateLimiter,
} from "@/lib/ratelimit"

function text(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function numberOrUndefined(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || value.trim().length === 0) return undefined
  return Number(value)
}

export async function createListingAction(
  _prevState: CreateListingState,
  formData: FormData
): Promise<CreateListingState> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/listings/create")
  }

  if (!isRateLimitConfigured) {
    return { error: "E'lon yaratish xizmati vaqtincha ishlamayapti" }
  }

  try {
    const ip = getClientIp(headers().get("x-forwarded-for"))
    const rateLimit = await listingCreateLimiter.limit(ip)
    if (!rateLimit.success) {
      return {
        error: "Juda ko'p e'lon yaratdingiz. Iltimos, keyinroq urinib ko'ring.",
      }
    }
  } catch (error) {
    console.error("createListingAction rate limit check failed:", error)
    return { error: "E'lon yaratish xizmati vaqtincha ishlamayapti" }
  }

  const images = formData
    .getAll("images")
    .filter((value): value is string => typeof value === "string" && value.length > 0)

  const parsed = CreateListingSchema.safeParse({
    title: text(formData.get("title")),
    description: text(formData.get("description")),
    type: text(formData.get("type")),
    category: text(formData.get("category")),
    price: numberOrUndefined(formData.get("price")),
    currency: text(formData.get("currency")) ?? "UZS",
    region: text(formData.get("region")),
    district: text(formData.get("district")),
    address: text(formData.get("address")),
    rooms: numberOrUndefined(formData.get("rooms")),
    area: numberOrUndefined(formData.get("area")),
    images,
  })

  if (!parsed.success) {
    return {
      error: "Ma'lumotlarni to'g'ri to'ldiring",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  if (parsed.data.images.some((url) => !isListingImageUrl(url))) {
    return { error: "Rasmlar Supabase Storage orqali yuklanishi kerak" }
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        type: parsed.data.type,
        category: parsed.data.category,
        price: parsed.data.price,
        currency: parsed.data.currency,
        region: parsed.data.region,
        district: parsed.data.district ?? "",
        address: parsed.data.address ?? "",
        rooms: parsed.data.rooms,
        area: parsed.data.area,
        images: parsed.data.images,
        userId: session.user.id,
        status: "PENDING",
      },
    })

    try {
      await sendListingToTelegram({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        region: listing.region,
        district: listing.district,
        images: listing.images,
      })
    } catch {
      // Telegram notification failures are logged by sendListingToTelegram.
    }
  } catch (error) {
    console.error("createListingAction error:", error)
    return { error: "E'lonni saqlashda xatolik yuz berdi. Qayta urinib ko'ring." }
  }

  revalidatePath("/my-listings")
  revalidatePath("/listings")
  redirect("/my-listings?created=1")
}
