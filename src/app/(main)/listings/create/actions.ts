"use server"

import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { randomUUID } from "node:crypto"
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

function slugPart(value: string): string {
  return value
    .toLocaleLowerCase("uz-UZ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻʼ'`’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
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
    latitude: numberOrUndefined(formData.get("latitude")),
    longitude: numberOrUndefined(formData.get("longitude")),
    rooms: numberOrUndefined(formData.get("rooms")),
    area: numberOrUndefined(formData.get("area")),
    renovation: text(formData.get("renovation")),
    hasGas: formData.get("hasGas") === "on",
    hasWater: formData.get("hasWater") === "on",
    hasElectricity: formData.get("hasElectricity") === "on",
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
    const slugBase = slugPart([
      parsed.data.rooms ? `${parsed.data.rooms}-xonalik` : "",
      parsed.data.title,
      parsed.data.district,
      parsed.data.region,
    ].filter(Boolean).join(" "));
    const slug = `${slugBase || "elon"}-${randomUUID().slice(0, 8)}`;
    const listing = await prisma.listing.create({
      data: {
        slug,
        renovation: parsed.data.renovation,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        type: parsed.data.type,
        category: parsed.data.category,
        price: parsed.data.price,
        currency: parsed.data.currency,
        region: parsed.data.region,
        district: parsed.data.district ?? "",
        address: parsed.data.address ?? "",
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        rooms: parsed.data.rooms,
        area: parsed.data.area,
        hasGas: parsed.data.hasGas ?? false,
        hasWater: parsed.data.hasWater ?? false,
        hasElectricity: parsed.data.hasElectricity ?? false,
        images: parsed.data.images,
        userId: session.user.id,
        status: "PENDING",
      },
      include: { user: { select: { name: true, phone: true } } },
    })

    try {
      await sendListingToTelegram({
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: listing.currency,
        region: listing.region,
        district: listing.district,
        address: listing.address,
        rooms: listing.rooms,
        area: listing.area,
        floor: listing.floor,
        totalFloors: listing.totalFloors,
        renovation: listing.renovation,
        hasGas: listing.hasGas,
        hasWater: listing.hasWater,
        hasElectricity: listing.hasElectricity,
        images: listing.images,
        latitude: listing.latitude,
        longitude: listing.longitude,
        user: listing.user,
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
