import { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma" // Eslatma: odatda prisma lib/prisma dan import qilinadi. Agar sizda auth.ts da bo'lsa, o'sha holicha qoldiring.

// XOTIRANI TEJASH: Har safar emas, har 1 soatda yangilanadi
export const revalidate = 3600 

const BASE_URL = "https://olsotmarket.uz" // TO'G'RILANDI

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Dinamik E'lonlar (Slug bilan)
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { 
      id: true, 
      slug: true, // YANGI: Slug qo'shildi
      updatedAt: true 
    },
    orderBy: { updatedAt: "desc" }, // Eng yangilari birinchi
    take: 5000,
  })

  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({
    url: `${BASE_URL}/listing/${l.slug || l.id}`, // Slug bo'lsa slug, bo'lmasa ID
    lastModified: l.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  // 2. Statik Sahifalar
  const now = new Date()
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/listings`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/listings/create`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ]

  return [...staticPages, ...listingPages]
}