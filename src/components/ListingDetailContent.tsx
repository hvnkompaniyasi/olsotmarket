import type { Listing, User } from "@prisma/client"
import { Armchair, BedDouble, Building2, Crown, MapPin, Ruler } from "lucide-react"
import BackButton from "@/components/BackButton"
import FavoriteToggle from "@/components/FavoriteToggle"
import ListingFacts from "@/components/ListingFacts"
import ListingGallery from "@/components/ListingGallery"
import ListingLocationMap from "@/components/ListingLocationMap"
import ListingSellerSummary from "@/components/ListingSellerSummary"
import ShareListingButton from "@/components/ShareListingButton"

type ListingWithSeller = Listing & { user: Pick<User, "name" | "phone"> }

interface ListingDetailContentProps {
  listing: ListingWithSeller
  isFavorite: boolean
  price: string
  category: string
}

export default function ListingDetailContent({
  listing,
  isFavorite,
  price,
  category,
}: ListingDetailContentProps) {
  const address = [listing.region, listing.district, listing.address].filter(Boolean).join(", ")
  
  const summary = [
    { 
      label: "Jixoz", 
      value: listing.furniture ? "Bor" : "Yo'q", 
      icon: Armchair 
    },
    { 
      label: "Xonalar", 
      value: listing.rooms ? `${listing.rooms} xona` : "—", 
      icon: BedDouble 
    },
    {
      label: "Qavat",
      value: listing.floor !== null
        ? `${listing.floor}${listing.totalFloors !== null ? `/${listing.totalFloors}` : ""}`
        : "—",
      icon: Building2,
    },
    { 
      label: "Maydoni", 
      value: listing.area ? `${listing.area} m²` : "—", 
      icon: Ruler 
    },
  ]

  return (
    <>
      <section className="relative">
        <ListingGallery
          images={listing.images}
          title={listing.title}
          toolbar={
            /* Bu yerdagi 'absolute' ni 'fixed' ga o'zgartirdik va z-index ni oshirdik */
            <div className="fixed left-4 right-4 top-4 z-[100] flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto">
                <BackButton />
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <ShareListingButton
                  title={listing.title}
                  compact
                />
                <FavoriteToggle listingId={listing.id} initial={isFavorite} />
              </div>
            </div>
          }
        />
        <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex gap-1.5">
          <span className="rounded-md bg-emerald-700/95 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
            {category}
          </span>
          {listing.isPremium && (
            <span className="flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
              <Crown className="h-3 w-3" /> VIP
            </span>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-3.5 px-4 pb-8 pt-4 sm:px-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <strong className="text-2xl font-extrabold tracking-tight text-emerald-700">{price}</strong>
          </div>
          <h1 className="mt-2.5 text-lg font-bold leading-snug text-gray-900 sm:text-2xl">
            {listing.title}
          </h1>
          <div className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <span>
              {address}
              {listing.latitude !== null && listing.longitude !== null && (
                <a href="#listing-map" className="ml-1 font-semibold text-emerald-700">
                  Xaritada ko&apos;rish
                </a>
              )}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-start gap-3 border-t border-gray-100 pt-2.5 text-[10px] text-gray-400">
            <span>
              {new Intl.DateTimeFormat("uz-UZ", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(listing.createdAt)} da joylashtirildi
            </span>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-2" aria-label="Asosiy xususiyatlar">
          {summary.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex min-w-0 flex-col items-center rounded-xl border border-gray-100 bg-white px-1 py-3 text-center shadow-sm"
            >
              <span className="mb-1 grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="w-full break-words text-[11px] font-bold text-gray-900">{value}</span>
              <span className="mt-0.5 text-[9px] text-gray-400">{label}</span>
            </div>
          ))}
        </section>

        <ListingFacts listing={listing} />

        {listing.latitude !== null && listing.longitude !== null && (
          <div id="listing-map">
            <ListingLocationMap
              latitude={listing.latitude}
              longitude={listing.longitude}
              district={listing.district}
            />
          </div>
        )}
        <ListingSellerSummary listing={listing} />
      </main>
    </>
  )
}