import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { DEAL_TYPES } from "@/lib/locations"
import ListingCard from "@/components/ListingCard"

const HOME_LIMIT = 12

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
  createdAt: true,
} as const

export default async function HomeListings() {
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
      take: HOME_LIMIT,
      select: cardSelect,
    }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
  ])

  if (listings.length === 0) return null

  return (
    <section className="pb-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            Yangi e&apos;lonlar
          </h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {total} ta faol e&apos;lon
          </p>
        </div>
        <Link
          href="/listings"
          className="text-xs font-bold text-[#0A7C4E] dark:text-emerald-400 flex items-center gap-1"
        >
          Barchasi <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {listings.map((l) => (
          <ListingCard
            key={l.id}
            id={l.id}
            title={l.title}
            price={l.price}
            location={[l.region, l.district].filter(Boolean).join(", ")}
            rooms={l.rooms || 0}
            area={l.area || 0}
            image={l.images?.[0] || ""}
            type={DEAL_TYPES.find((d) => d.id === l.type)?.name || l.type}
            isPremium={l.isPremium}
            createdAt={l.createdAt.toISOString()}
            isFavorited={false}
          />
        ))}
      </div>
    </section>
  )
}
