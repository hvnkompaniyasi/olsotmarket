import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, Home, MapPin } from "lucide-react"
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"
import { formatPrice } from "@/lib/format"
import Navbar from "@/components/Navbar"
import MobileNav from "@/components/MobileNav"
import RemoveFavoriteButton from "@/components/RemoveFavoriteButton"
import { DEAL_TYPES } from "@/lib/locations"

export const dynamic = "force-dynamic"

// 1. SEO VA MAXFIYLIK
export const metadata: Metadata = {
  title: "Sevimlilar | Olsot Market",
  description: "Saqlangan e'lonlaringiz ro'yxati",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: { images: ["/logo.svg"] },
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login?callbackUrl=/favorites")

  // 2. OPTIMALLASHTIRILGAN SO'ROV (Faqat kerakli ustunlarni olamiz)
  const favorites = await prisma.favorite.findMany({
    where: { 
      userId: session.user.id,
      listing: { status: "ACTIVE" } // Filter bazada bajariladi
    },
    include: { 
      listing: {
        select: {
          id: true,
          title: true,
          price: true,
          currency: true, // Valyutani olish shart
          images: true,
          region: true,
          district: true,
          type: true,
        }
      } 
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-10">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5">
        <div className="flex items-center gap-2.5 mb-1">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Sevimlilar</h1>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
          {favorites.length} ta saqlangan e&apos;lon
        </p>

        {favorites.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <Heart className="h-12 w-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Hali sevimli e&apos;lonlaringiz yo&apos;q
            </p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#0A7C4E] to-[#08623D] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              <Home className="h-4 w-4" /> E&apos;lonlarni ko&apos;rish
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {favorites.map((f) => (
              <div key={f.id} className="relative group">
                <Link
                  href={`/listing/${f.listing.id}`}
                  className="block bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="relative h-32 sm:h-44 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    {f.listing.images?.[0] && (
                      <Image 
                        src={f.listing.images[0]} 
                        alt={f.listing.title || "E'lon rasmi"} 
                        fill 
                        sizes="(max-width: 640px) 50vw, 33vw" 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    )}
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur rounded-lg text-[10px] font-bold text-gray-800 dark:text-gray-200 shadow-sm">
                      {DEAL_TYPES.find((d) => d.id === f.listing.type)?.name || f.listing.type}
                    </span>
                  </div>
                  
                  <div className="p-3 sm:p-4">
                    <div className="text-base sm:text-lg font-extrabold text-[#0A7C4E] dark:text-emerald-500">
                      {/* 3. XATO TUZATILDI: formatPrice va valyuta */}
                      {formatPrice(f.listing.price, f.listing.currency || "UZS")}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mt-1">
                      {f.listing.title || "Sarlavhasiz"}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {f.listing.region}
                      {f.listing.district ? `, ${f.listing.district}` : ""}
                    </div>
                  </div>
                </Link>
                <RemoveFavoriteButton listingId={f.listing.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  )
}