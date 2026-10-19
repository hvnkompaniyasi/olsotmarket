import Link from "next/link";
import { ArrowRight, Crown, MapPin, BedDouble, Ruler } from "lucide-react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { DEAL_TYPES } from "@/lib/locations";

const premiumSelect = {
  id: true,
  title: true,
  price: true,
  images: true,
  region: true,
  district: true,
  rooms: true,
  area: true,
  type: true,
} as const;

export default async function FeaturedListings() {
  const premium = await prisma.listing.findMany({
    where: { status: "ACTIVE", isPremium: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: premiumSelect,
  });

  if (premium.length === 0) return null;

  return (
    <section className="pb-7">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-[0_6px_18px_rgba(245,158,11,0.4)]">
            <Crown className="h-5 w-5 text-amber-950" />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
              VIP e&apos;lonlar
            </h2>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
              Premium joylashtirilgan e&apos;lonlar
            </p>
          </div>
        </div>
        <Link
          href="/listings"
          className="text-xs font-bold text-[#0A7C4E] dark:text-emerald-400 flex items-center gap-1"
        >
          Barchasi <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex gap-3.5 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory pb-2">
        {premium.map((l) => {
          const deal = DEAL_TYPES.find((d) => d.id === l.type)?.name || l.type;
          return (
            <Link
              key={l.id}
              href={`/listing/${l.id}`}
              className="relative w-[240px] sm:w-[280px] flex-shrink-0 snap-start aspect-[3/4] rounded-3xl overflow-hidden group shadow-[0_12px_40px_rgba(245,158,11,0.20)] hover:shadow-[0_16px_48px_rgba(245,158,11,0.32)] transition-shadow"
            >
              {l.images?.[0] ? (
                <Image
                  src={l.images[0]}
                  alt={l.title}
                  fill
                  sizes="(max-width: 640px) 240px, 280px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-zinc-800 dark:to-zinc-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

              <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-extrabold text-amber-950 flex items-center gap-1 shadow-lg">
                <Crown className="h-3 w-3" /> VIP
              </span>

              <div className="absolute bottom-0 inset-x-0 p-4">
                <p className="text-white text-xl font-extrabold leading-tight drop-shadow-md">
                  {formatPrice(l.price, deal)}
                </p>
                <p className="text-white/95 text-sm font-bold line-clamp-1 mt-1">{l.title}</p>
                <p className="text-white/60 text-[11px] font-medium flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-1">
                    {[l.region, l.district].filter(Boolean).join(", ")}
                  </span>
                </p>
                <div className="glass-pill flex items-center gap-3 mt-2.5 px-3 py-2 rounded-xl w-fit">
                  {(l.rooms ?? 0) > 0 && (
                    <span className="text-[10px] font-bold text-white flex items-center gap-1">
                      <BedDouble className="h-3 w-3" /> {l.rooms}
                    </span>
                  )}
                  {(l.area ?? 0) > 0 && (
                    <span className="text-[10px] font-bold text-white flex items-center gap-1">
                      <Ruler className="h-3 w-3" /> {l.area} m²
                    </span>
                  )}
                  <span className="text-[10px] font-extrabold text-amber-300">{deal}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
