"use client"

import { memo } from "react"
import Image from "next/image"
import Link from "next/link"
import { BedDouble, Layers3, MapPin, Ruler } from "lucide-react"
import { PROPERTY_CATEGORIES } from "@/lib/locations"
import { formatPrice } from "@/lib/format"
import FavoriteToggle from "./FavoriteToggle"

export interface ListingCardProps {
  id: string
  title: string
  price: number
  location: string
  rooms: number
  area: number
  image: string
  type: string
  seller?: string
  category?: string
  floor?: number | null
  totalFloors?: number | null
  isPremium?: boolean
  priority?: boolean
  createdAt?: string
  isFavorited?: boolean
  currency?: string // YANGI QO'SHILDI (Narxni to'g'ri formatlash uchun)
}

function ListingCardBase({
  id,
  title,
  price,
  location,
  rooms,
  area,
  image,
  type,
  category,
  floor,
  totalFloors,
  isPremium,
  priority = false,
  isFavorited,
  currency = "UZS", // Standart qiymat
}: ListingCardProps) {
  const categoryLabel =
    PROPERTY_CATEGORIES.find((item) => item.id === category)?.name ?? type

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-3px_rgba(17,24,39,0.06),0_2px_6px_-1px_rgba(17,24,39,0.03)] transition hover:shadow-[0_8px_26px_-4px_rgba(17,24,39,0.1)]">
      <Link
        href={`/listing/${id}`}
        aria-label={`${title || "Sarlavhasiz"} — ${formatPrice(price, currency)}`}
        className="block outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-emerald-500"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {image ? (
            <Image
              src={image}
              alt={title ? `${title} — e'lon rasmi` : "Ko'chmas mulk e'lonining rasmi"}
              fill
              priority={priority}
              // Telefonlarda 100%, planshetda 50%, kompyuterda 33% o'lchamda yuklaydi
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-slate-100" />
          )}
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
            {categoryLabel}
          </span>
        </div>

        <div className="flex flex-col p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-xl font-bold leading-7 tracking-tight text-emerald-800 tabular-nums">
              {/* XATO TUZATILDI: type emas, currency ishlatiladi */}
              {formatPrice(price, currency)}
            </p>
            {isPremium && (
              <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                Premium
              </span>
            )}
          </div>
          <h3 className="mt-1 line-clamp-1 text-base font-semibold leading-6 tracking-tight text-gray-950">
            {title || "Sarlavhasiz"}
          </h3>
          <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-800" />
            <span className="truncate">{location}</span>
          </p>
          {(rooms > 0 || area > 0 || floor != null || totalFloors != null) && (
            <div className="mt-3.5 flex min-w-0 items-center justify-between gap-2 rounded-xl bg-[#f1f3ff] px-3 py-2.5 text-xs font-medium text-slate-700 dark:bg-zinc-800/50 dark:text-gray-300">
              {rooms > 0 && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <BedDouble className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{rooms} xona</span>
                </span>
              )}
              {area > 0 && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Ruler className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{area} m²</span>
                </span>
              )}
              {(floor != null || totalFloors != null) && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <Layers3 className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="truncate">{floor ?? "—"}/{totalFloors ?? "—"}-qavat</span>
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="absolute right-3 top-3 z-10">
        <FavoriteToggle listingId={id} initial={!!isFavorited} />
      </div>
    </article>
  )
}

// REACT.MEMO: Qayta yuklanishlarni bloklaydi va sayt tezligini oshiradi
const ListingCard = memo(ListingCardBase)

export default ListingCard