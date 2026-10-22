import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { DEAL_TYPES } from "@/lib/locations";
import Navbar from "@/components/Navbar";
import ListingsFilters from "@/components/ListingsFilters";
import ListingsGrid from "@/components/ListingsGrid";
import ListingsPagination from "@/components/ListingsPagination";
import ViewToggle from "@/components/ViewToggle";
import ListingsMap from "@/components/ListingsMap";
import ListingCardLarge from "@/components/ListingCardLarge";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export const metadata = {
  title: "Barcha e'lonlar | Olsot Market",
  description: "O'zbekiston bo'ylab barcha faol uy-joy e'lonlari — qidiring, filtrlang, xaritada ko'ring",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Record<string, string | undefined>;
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const view = searchParams.view === "map" || searchParams.view === "large" ? searchParams.view : "grid";
  const perPage = 12;

  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };
  const t = searchParams.type;
  if (t === "SALE" || t === "RENT" || t === "DAILY") where.type = t;
  if (searchParams.region) where.region = searchParams.region;
  if (searchParams.q) where.title = { contains: searchParams.q, mode: "insensitive" };

  const [total, listings, regionRows] = await prisma.$transaction([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy: [{ isPremium: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      include: { user: { select: { name: true } } },
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE" },
      distinct: ["region"],
      select: { region: true },
      orderBy: { region: "asc" },
    }),
  ]);

  const regions = regionRows.map((r) => r.region).filter((r): r is string => Boolean(r));

  const rest = new URLSearchParams();
  Object.entries(searchParams).forEach(([k, v]) => {
    if (k !== "page" && v) rest.set(k, v);
  });

  const mapListings = listings
    .filter((l) => l.latitude !== null && l.longitude !== null)
    .map((l) => ({
      id: l.id,
      title: l.title,
      price: formatPrice(l.price, DEAL_TYPES.find((d) => d.id === l.type)?.name || l.type),
      lat: l.latitude as number,
      lng: l.longitude as number,
      image: l.images?.[0] || "",
      isPremium: l.isPremium,
    }));

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pb-24 lg:pb-10">
        <div className="flex items-center justify-between gap-3 pt-4 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              Barcha e'lonlar
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              O'zingizga mos uy-joyni toping
            </p>
          </div>
          <Link
            href="/map"
            className="h-10 px-3.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:border-[#0A7C4E] transition-colors flex-shrink-0"
          >
            <MapPin className="h-4 w-4 text-[#0A7C4E]" /> Xaritada
          </Link>
        </div>

        <ListingsFilters regions={regions} />
        <div className="flex items-center justify-between gap-3 pb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Topildi:{" "}
            <span className="font-extrabold text-gray-900 dark:text-white">
              {total.toLocaleString("ru-RU")}
            </span>{" "}
            ta e'lon
          </p>
          <ViewToggle />
        </div>

        {view === "map" ? (
          <div className="pb-4">
            <ListingsMap listings={mapListings} />
          </div>
        ) : view === "large" ? (
          <div className="space-y-3 pb-4">
            {listings.map((l) => (
              <ListingCardLarge
                key={l.id}
                id={l.id}
                title={l.title}
                price={l.price}
                location={[l.region, l.district].filter(Boolean).join(", ")}
                rooms={l.rooms || 0}
                area={l.area || 0}
                image={l.images?.[0] || ""}
                type={DEAL_TYPES.find((d) => d.id === l.type)?.name || l.type}
                seller={l.user?.name || undefined}
                isPremium={l.isPremium}
              />
            ))}
          </div>
        ) : (
          <ListingsGrid listings={listings} total={total} />
        )}
        <ListingsPagination total={total} page={page} perPage={perPage} params={rest.toString()} />
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}
