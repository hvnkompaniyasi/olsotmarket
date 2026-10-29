import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Ruler, Crown } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface ListingCardLargeProps {
  id: string;
  title: string;
  price: number;
  currency?: string; // Valyuta qo'shildi
  location: string;
  rooms: number;
  area: number;
  image: string;
  type: string;
  seller?: string;
  isPremium?: boolean;
}

export default function ListingCardLarge({
  id, title, price, currency = "UZS", location, rooms, area, image, type, seller, isPremium,
}: ListingCardLargeProps) {
  return (
    <Link
      href={`/listing/${id}`}
      className="glass flex rounded-3xl overflow-hidden shadow-[0_6px_24px_rgba(10,124,78,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(10,124,78,0.16)] active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <div className="relative w-2/5 min-w-[130px] aspect-[4/3] sm:aspect-auto sm:self-stretch">
        {image ? (
          <Image src={image} alt={title ? `${title} — e'lon rasmi` : "Ko'chmas mulk e'lonining rasmi"} fill sizes="(max-width: 640px) 40vw, 240px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-zinc-800 dark:to-zinc-900" />
        )}
        {isPremium && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-extrabold text-amber-950 flex items-center gap-1 shadow">
            <Crown className="h-3 w-3" /> VIP
          </span>
        )}
      </div>
      <div className="flex-1 p-3.5 sm:p-4 min-w-0">
        {/* formatPrice funksiyasiga currency ni uzatamiz */}
        <p className="text-lg font-extrabold text-[#0A7C4E] sm:text-xl">
          {formatPrice(price, type, currency)}
        </p>
        <p className="mt-0.5 line-clamp-1 text-sm font-bold text-gray-900 dark:text-white">{title || "Sarlavhasiz"}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
          <MapPin className="h-3.5 w-3.5" /> <span className="line-clamp-1">{location}</span>
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <span className="glass-pill px-2.5 py-1 rounded-lg text-[10px] font-bold text-gray-700 dark:text-gray-200">{type}</span>
          {rooms > 0 && (
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-[#0A7C4E]" /> {rooms}
            </span>
          )}
          {area > 0 && (
            <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5 text-[#0A7C4E]" /> {area} m²
            </span>
          )}
        </div>
        {seller && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Sotuvchi: {seller}</p>}
      </div>
    </Link>
  );
}