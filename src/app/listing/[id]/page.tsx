import { notFound } from "next/navigation";
import {
  MapPin, Home, Ruler, Layers, Flame, Droplets, Zap, User, Crown, BedDouble, Building2,
} from "lucide-react";
import { prisma } from "@/lib/auth";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import ListingGallery from "@/components/ListingGallery";
import MessageButton from "@/components/MessageButton";
import ShareListingButton from "@/components/ShareListingButton";
import BackButton from "@/components/BackButton";
import FavoriteToggle from "@/components/FavoriteToggle";
import SellerContactCard from "@/components/SellerContactCard";
import PhoneReveal from "@/components/PhoneReveal";
import { formatPrice } from "@/lib/format";
import { DEAL_TYPES } from "@/lib/locations";

export const dynamic = "force-dynamic";

const categoryNames: Record<string, string> = {
  APARTMENT: "Kvartira",
  HOUSE: "Uy / Hovli",
  OFFICE: "Ofis",
  LAND: "Yer uchastkasi",
  WAREHOUSE: "Ombor",
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const l = await prisma.listing.findUnique({
    where: { id: params.id },
    select: { title: true, description: true, images: true, price: true, type: true, currency: true },
  });
  if (!l) return { title: "E'lon topilmadi | Olsot Market" };
  const deal = DEAL_TYPES.find((d) => d.id === l.type)?.name || l.type;
  const priceStr = formatPrice(l.price, deal, l.currency);
  return {
    title: `${l.title} — ${priceStr} | Olsot Market`,
    description: (l.description || l.title).slice(0, 160),
    openGraph: {
      title: l.title,
      description: (l.description || "").slice(0, 120),
      images: l.images?.[0] ? [l.images[0]] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, phone: true } } },
  });
  if (!listing || listing.status !== "ACTIVE") notFound();

  const isFavorite = session?.user?.id
    ? !!(await prisma.favorite.findFirst({
        where: { userId: session.user.id, listingId: listing.id },
        select: { id: true },
      }))
    : false;

  const similar = await prisma.listing.findMany({
    where: { id: { not: listing.id }, region: listing.region, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { user: { select: { name: true } } },
  });

  const dealName = DEAL_TYPES.find((d) => d.id === listing.type)?.name || listing.type;
  const priceStr = formatPrice(listing.price, dealName, listing.currency);

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-32 lg:pb-10">
      <Navbar />

      {/* ===== IMMERSIVE GALEREYA ===== */}
      <div className="relative">
        <ListingGallery images={listing.images || []} title={listing.title} />
        <div className="absolute top-3 left-3 z-20">
          <BackButton />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* ===== SUZUVCHI GLASS INFO PANEL (rasm ustiga chiqib turadi) ===== */}
        <div className="relative -mt-10 z-10 glass rounded-3xl p-4 sm:p-6 shadow-[0_12px_40px_rgba(10,124,78,0.15)]">
          {/* Badge'lar */}
          <div className="flex flex-wrap gap-2 mb-3">
            {listing.isPremium && (
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[11px] font-extrabold text-amber-950 flex items-center gap-1 shadow-md">
                <Crown className="h-3 w-3" /> VIP
              </span>
            )}
            <span className="glass-pill px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-200">
              {dealName}
            </span>
            <span className="glass-pill px-3 py-1.5 rounded-full text-[11px] font-bold text-gray-700 dark:text-gray-200">
              {categoryNames[listing.category] || listing.category}
            </span>
          </div>

          {/* Sarlavha + manzil */}
          <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {listing.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#0A7C4E] flex-shrink-0" />
            <span className="line-clamp-1">
              {[listing.region, listing.district, listing.address].filter(Boolean).join(", ")}
            </span>
          </p>

          {/* Glass stats panel */}
          <div className="glass-pill rounded-2xl p-3 sm:p-4 mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(listing.rooms ?? 0) > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <BedDouble className="h-4 w-4 text-[#0A7C4E]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Xonalar</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{listing.rooms ?? 0} ta</p>
                  </div>
                </div>
              )}
              {(listing.area ?? 0) > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Ruler className="h-4 w-4 text-[#0A7C4E]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Maydon</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">{listing.area ?? 0} m²</p>
                  </div>
                </div>
              )}
              {(listing.floor ?? 0) > 0 && (
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-[#0A7C4E]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Qavat</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                      {listing.floor}{listing.totalFloors ? `/${listing.totalFloors}` : ""}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-[#0A7C4E]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Sotuvchi</p>
                  <p className="text-sm font-extrabold text-gray-900 dark:text-white line-clamp-1">
                    {listing.user?.name || "Anonim"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Narx */}
          <div className="flex items-end justify-between gap-3 mt-4 pt-4 border-t border-gray-200/50 dark:border-zinc-700/50">
            <div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Narx</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0A7C4E] leading-tight">
                {priceStr}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteToggle listingId={listing.id} initial={isFavorite} />
              <ShareListingButton title={listing.title} />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-4">
            {/* ===== TAVSIF ===== */}
            {listing.description && (
              <section className="glass rounded-2xl p-4 sm:p-5">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-2">
                  Tavsif
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </section>
            )}

            {/* ===== FACILITIES ===== */}
            {(listing.hasGas || listing.hasWater || listing.hasElectricity) && (
              <section className="glass rounded-2xl p-4 sm:p-5">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-white mb-3">
                  Qulayliklar
                </h2>
                <div className="flex flex-wrap gap-2">
                  {listing.hasGas && (
                    <span className="glass-pill px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-[#0A7C4E]" /> Gaz
                    </span>
                  )}
                  {listing.hasWater && (
                    <span className="glass-pill px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-[#0A7C4E]" /> Suv
                    </span>
                  )}
                  {listing.hasElectricity && (
                    <span className="glass-pill px-3 py-2 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-[#0A7C4E]" /> Elektr
                    </span>
                  )}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-20">
            <SellerContactCard
              sellerName={listing.user?.name ?? null}
              phone={listing.user?.phone ?? null}
              createdAt={listing.createdAt.toISOString()}
            />
          </aside>
        </div>

        {/* ===== O'XSHASH E'LONLAR ===== */}
        {similar.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white mb-3 px-1">
              {listing.region}dagi o'xshash e'lonlar
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {similar.map((l) => (
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
                  seller={l.user?.name || undefined}
                  isPremium={l.isPremium}
                  createdAt={l.createdAt.toISOString()}
                  isFavorited={false}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ===== STICKY GLASS CTA ===== */}
      <div className="fixed bottom-0 inset-x-0 z-30 lg:static lg:mt-6 lg:mx-auto lg:max-w-6xl lg:px-3 sm:lg:px-6">
        <div className="glass border-t border-white/50 dark:border-zinc-700/50 px-3 sm:px-6 py-3 lg:rounded-2xl lg:border lg:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="max-w-6xl mx-auto flex items-center gap-2.5">
            <div className="flex-1 min-w-0 lg:flex-initial lg:mr-auto">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Narx</p>
              <p className="text-lg font-extrabold text-[#0A7C4E] leading-tight truncate">
                {priceStr}
              </p>
            </div>
            <PhoneReveal phone={listing.user?.phone ?? null} compact />
            <div className="h-11">
              <MessageButton listingId={listing.id} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileNav />
    </div>
  );
}
