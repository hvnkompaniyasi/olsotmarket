import type { ListingType, Prisma, PropertyCategory } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { DEAL_TYPES, PROPERTY_CATEGORIES } from "@/lib/locations"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import Categories from "@/components/Categories"
import HomeListings from "@/components/HomeListings"
import Advantages from "@/components/Advantages"
import Footer from "@/components/Footer"
import MobileNav from "@/components/MobileNav"

export const revalidate = 3600

export const metadata = {
  title: "Olsot Market — O'zbekistondagi ishonchli ko'chmas mulk platformasi",
  description:
    "Kvartira, uy, ofis va yer e'lonlari — sotib olish, ijaraga. Xaritada qidiring, to'g'ridan-to'g'ri sotuvchi bilan bog'laning.",
}

const HOME_LIMIT = 12
const TYPE_IDS = new Set(DEAL_TYPES.map((deal) => deal.id))
const CATEGORY_IDS = new Set(PROPERTY_CATEGORIES.map((category) => category.id))

type SearchParamValue = string | string[] | undefined

interface HomePageProps {
  searchParams: Record<string, SearchParamValue>
}

function getParam(value: SearchParamValue): string {
  const raw = Array.isArray(value) ? value[0] : value
  return raw?.trim() ?? ""
}

function parsePrice(value: string): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

const cardSelect = {
  id: true,
  title: true,
  price: true,
  images: true,
  region: true,
  district: true,
  rooms: true,
  area: true,
  type: true,
  isPremium: true,
  category: true,
  floor: true,
  totalFloors: true,
  createdAt: true,
} as const

export default async function HomePage({ searchParams }: HomePageProps) {
  const query = getParam(searchParams.q)
  const type = getParam(searchParams.type)
  const category = getParam(searchParams.category)
  const region = getParam(searchParams.region)
  const district = getParam(searchParams.district)
  const minPrice = parsePrice(getParam(searchParams.minPrice))
  const maxPrice = parsePrice(getParam(searchParams.maxPrice))
  const rooms = getParam(searchParams.rooms)
  const sortBy = getParam(searchParams.sortBy)

  const where: Prisma.ListingWhereInput = { status: "ACTIVE" }
  if (type && TYPE_IDS.has(type)) where.type = type as ListingType
  if (category && CATEGORY_IDS.has(category)) where.category = category as PropertyCategory
  if (region) where.region = region
  if (district) where.district = district
  if (rooms === "4+") where.rooms = { gte: 4 }
  else if (["1", "2", "3"].includes(rooms)) where.rooms = Number(rooms)
  if (query) {
    where.OR = ["title", "description", "address", "region", "district"].map((field) => ({
      [field]: { contains: query, mode: "insensitive" },
    }))
  }

  const priceFilter: Prisma.FloatFilter = {}
  if (minPrice !== undefined) priceFilter.gte = minPrice
  if (maxPrice !== undefined) priceFilter.lte = maxPrice
  if (minPrice !== undefined || maxPrice !== undefined) where.price = priceFilter

  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sortBy === "price-asc"
      ? [{ price: "asc" }]
      : sortBy === "price-desc"
        ? [{ price: "desc" }]
        : [{ isPremium: "desc" }, { createdAt: "desc" }]

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      take: HOME_LIMIT,
      select: cardSelect,
    }),
    prisma.listing.count({ where }),
  ])

  const queryParams = new URLSearchParams()
  if (query) queryParams.set("q", query)
  if (type && TYPE_IDS.has(type)) queryParams.set("type", type)
  if (category && CATEGORY_IDS.has(category)) queryParams.set("category", category)
  if (region) queryParams.set("region", region)
  if (district) queryParams.set("district", district)
  if (["1", "2", "3", "4+"].includes(rooms)) queryParams.set("rooms", rooms)
  if (sortBy === "price-asc" || sortBy === "price-desc") queryParams.set("sortBy", sortBy)
  if (minPrice !== undefined) queryParams.set("minPrice", String(minPrice))
  if (maxPrice !== undefined) queryParams.set("maxPrice", String(maxPrice))
  const queryString = queryParams.toString()
  const hasFilters = queryString.length > 0

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hero />
        <Categories selectedCategory={category} />
        <HomeListings
          listings={listings}
          total={total}
          hasFilters={hasFilters}
          queryString={queryString}
        />
        <Advantages />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
