import { createHash } from "node:crypto"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/auth"
import { getRedisCache, setRedisCache } from "@/lib/redis"

const LISTING_PAGE_SIZE = 12
const LISTING_CACHE_TTL_SECONDS = 300

// XATO TUZATILDI: currency: true qo'shildi
const listingSelect = {
  id: true,
  title: true,
  type: true,
  price: true,
  currency: true, 
  region: true,
  district: true,
  rooms: true,
  area: true,
  images: true,
  latitude: true,
  longitude: true,
  isPremium: true,
  createdAt: true,
  user: { select: { name: true } },
} satisfies Prisma.ListingSelect

export type ListingSummary = Prisma.ListingGetPayload<{ select: typeof listingSelect }>

export interface ListingPageData {
  total: number
  listings: ListingSummary[]
  regions: string[]
}

interface ListingPageParams {
  page: number
  type?: "SALE" | "RENT" | "DAILY"
  region?: string
  query?: string
}

// XATO TUZATILDI: currency: z.string() qo'shildi
const cachedListingPageSchema = z.object({
  total: z.number().int().nonnegative(),
  listings: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(["SALE", "RENT", "NEW_BUILDING", "DAILY"]),
      price: z.number(),
      currency: z.string(),
      region: z.string(),
      district: z.string(),
      rooms: z.number().nullable(),
      area: z.number().nullable(),
      images: z.array(z.string()),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
      isPremium: z.boolean(),
      createdAt: z.string().datetime(),
      user: z.object({ name: z.string().nullable() }),
    })
  ),
  regions: z.array(z.string()),
}).transform((data): ListingPageData => ({
  ...data,
  listings: data.listings.map(({ createdAt, ...listing }) => ({
    ...listing,
    createdAt: new Date(createdAt),
  })),
}))

function cacheKey(params: ListingPageParams): string {
  const hash = createHash("sha256").update(JSON.stringify(params)).digest("hex")
  return `listings:v1:page:${hash}`
}

export async function getCachedListingPage(params: ListingPageParams): Promise<ListingPageData> {
  const key = cacheKey(params)
  const cached = await getRedisCache(key)

  if (cached) {
    try {
      const parsed = cachedListingPageSchema.safeParse(JSON.parse(cached))
      if (parsed.success) return parsed.data
      console.error("Invalid listing page cache payload:", parsed.error.issues)
    } catch (error) {
      console.error("Unable to parse listing page cache payload:", error)
    }
  }

  const where: Prisma.ListingWhereInput = { status: "ACTIVE" }
  if (params.type) where.type = params.type
  if (params.region) where.region = params.region
  if (params.query) where.title = { contains: params.query, mode: "insensitive" }

  const [total, listings, regionRows] = await prisma.$transaction([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
      skip: (params.page - 1) * LISTING_PAGE_SIZE,
      take: LISTING_PAGE_SIZE,
      select: listingSelect,
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      distinct: ["region"],
      select: { region: true },
      orderBy: { region: "asc" },
    }),
  ])

  const data: ListingPageData = {
    total,
    listings,
    regions: regionRows.map((row) => row.region).filter((region): region is string => Boolean(region)),
  }
  await setRedisCache(key, JSON.stringify(data), LISTING_CACHE_TTL_SECONDS)
  return data
}