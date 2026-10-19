import Link from "next/link"
import Image from "next/image"
import type { Listing } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// Server Component — har so'rovda DB'dan yangi ma'lumot olinadi
export const dynamic = "force-dynamic"

export const metadata = {
  title: "Faol e'lonlar — Olsot Market",
  description: "Prisma + Server Component namuna sahifasi",
}

// Listing turi uchun o'zbekcha yorliqlar
const TYPE_LABELS: Record<string, string> = {
  SALE: "Sotiladi",
  RENT: "Ijaraga",
  NEW_BUILDING: "Yangi qurilish",
  DAILY: "Kunlik",
}

// Narxni o'qiladigan formatga o'girish (masalan: 1 250 000 UZS)
function formatListingPrice(price: number, currency: string): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(price)
  return `${formatted} ${currency?.toUpperCase() || "UZS"}`
}

export default async function ListingGridPage() {
  let listings: Listing[] = []

  // Xatolikni try/catch orqali boshqaramiz
  try {
    listings = await prisma.listing.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
      take: 24,
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error("E'lonlarni yuklashda xatolik:", error)

    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-red-600 dark:text-red-400 font-semibold">
          E&apos;lonlarni yuklashda xatolik yuz berdi. Keyinroq qayta urinib
          ko&apos;ring.
        </p>
        {process.env.NODE_ENV !== "production" && (
          <pre className="mt-4 text-left text-xs text-red-500/80 whitespace-pre-wrap break-words max-w-2xl mx-auto">
            {detail}
          </pre>
        )}
      </div>
    )
  }

  // Bo'sh holat
  if (listings.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 dark:text-gray-400 font-semibold text-lg">
          Hozircha faol e&apos;lonlar yo&apos;q
        </p>
      </div>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
        Faol e&apos;lonlar
      </h1>

      {/* Responsive grid: 1 / 2 / 3 / 4 ustun */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {listings.map((listing) => {
          const title = listing.title?.trim() || "Nomsiz e'lon"
          const deal = TYPE_LABELS[listing.type] ?? listing.type
          const location = [listing.region, listing.district]
            .filter(Boolean)
            .join(", ")

          return (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Rasm yoki placeholder */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                {listing.images?.[0] ? (
                  <Image
                    src={listing.images[0]}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-zinc-800 dark:to-zinc-700" />
                )}

                {/* Premium badge */}
                {listing.isPremium && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-extrabold text-amber-950 shadow-md">
                    Premium
                  </span>
                )}

                {/* Listing type badge */}
                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600/90 text-[10px] font-bold text-white shadow-md">
                  {deal}
                </span>
              </div>

              <div className="p-4">
                {/* Narx */}
                <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                  {formatListingPrice(listing.price, listing.currency)}
                </p>

                {/* Sarlavha */}
                <h2 className="mt-1 font-bold text-gray-900 dark:text-white line-clamp-1">
                  {title}
                </h2>

                {/* Manzil */}
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                  {location}
                </p>

                {/* Xususiyatlar */}
                <div className="flex items-center gap-3 mt-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  {typeof listing.rooms === "number" && listing.rooms > 0 && (
                    <span>{listing.rooms} xona</span>
                  )}
                  {typeof listing.area === "number" && listing.area > 0 && (
                    <span>{listing.area} m²</span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
