import Link from "next/link"
import { ArrowRight, SearchX } from "lucide-react"
import { DEAL_TYPES } from "@/lib/locations"
import ListingCard from "@/components/ListingCard"

export interface HomeListing {
  id: string
  title: string
  price: number
  images: string[]
  region: string
  district: string
  rooms: number | null
  area: number | null
  type: string
  isPremium: boolean
  createdAt: Date
}

interface HomeListingsProps {
  listings: HomeListing[]
  total: number
  hasFilters?: boolean
  queryString?: string
}

export default function HomeListings({
  listings,
  total,
  hasFilters = false,
  queryString = "",
}: HomeListingsProps) {
  if (listings.length === 0) {
    if (!hasFilters) return null

    return (
      <section className="pb-6">
        <div className="glass rounded-2xl p-8 sm:p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
            <SearchX className="h-6 w-6 text-[#0A7C4E]" />
          </div>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            Filtrlarga mos e&apos;lon topilmadi
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Narx oralig&apos;ini kengaytiring yoki boshqa hududni tanlab ko&apos;ring.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 h-10 px-4 rounded-xl bg-[#0A7C4E] hover:bg-[#086339] text-xs font-bold text-white transition-colors"
          >
            Filtrlarni tozalash
          </Link>
        </div>
      </section>
    )
  }

  const allHref = queryString ? `/listings?${queryString}` : "/listings"

  return (
    <section className="pb-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            {hasFilters ? "Qidiruv natijalari" : "Yangi e'lonlar"}
          </h2>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
            {total} ta {hasFilters ? "mos" : "faol"} e&apos;lon
          </p>
        </div>
        <Link
          href={allHref}
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
