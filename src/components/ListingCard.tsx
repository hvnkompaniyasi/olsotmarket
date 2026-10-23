"use client";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Ruler, Crown } from "lucide-react";
import { formatPrice } from "@/lib/format";
import FavoriteToggle from "./FavoriteToggle";

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  rooms: number;
  area: number;
  image: string;
  type: string;
  seller?: string;
  isPremium?: boolean;
  createdAt?: string;
  isFavorited?: boolean;
}

export default function ListingCard({
  id, title, price, location, rooms, area, image, type, isPremium, isFavorited,
}: ListingCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgba(10,124,78,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_44px_rgba(10,124,78,0.20)] active:scale-[0.99]">
      <Link
        href={`/listing/${id}`}
        aria-label={`${title || "Sarlavhasiz"} — ${formatPrice(price, type)}`}
        className="relative block aspect-[4/5] overflow-hidden bg-emerald-50 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-emerald-400 dark:bg-zinc-900"
      >
        {image ? (
          <Image
            src={image}
            alt={title ? `${title} — e'lon rasmi` : "Ko'chmas mulk e'lonining rasmi"}
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-zinc-800 dark:to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

        {/* Badge'lar + fav */}
        <div className="absolute top-2.5 left-2.5 right-14 flex items-start justify-between gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            {isPremium && (
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-extrabold text-amber-950 shadow-lg flex items-center gap-1">
                <Crown className="h-3 w-3" /> VIP
              </span>
            )}
            <span className="glass-pill px-2.5 py-1 rounded-full text-[10px] font-bold text-white">
              {type}
            </span>
          </div>
        </div>

        {/* Narx + sarlavha + stats (rasm ustida) */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <p className="text-white font-extrabold text-lg leading-tight drop-shadow-md sm:text-xl">
            {formatPrice(price, type)}
          </p>
          <p className="mt-0.5 line-clamp-1 text-sm font-bold text-white">
            {title || "Sarlavhasiz"}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-white/90">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{location}</span>
          </p>
          {(rooms > 0 || area > 0) && (
            <div className="glass-pill mt-2 flex w-fit items-center gap-2.5 rounded-xl px-2.5 py-1.5">
              {rooms > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-white">
                  <BedDouble className="h-3.5 w-3.5" /> {rooms} xona
                </span>
              )}
              {area > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-white">
                  <Ruler className="h-3.5 w-3.5" /> {area} m²
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
      <div className="absolute right-2.5 top-2.5 z-10">
        <FavoriteToggle listingId={id} initial={!!isFavorited} />
      </div>
    </article>
  );
}
