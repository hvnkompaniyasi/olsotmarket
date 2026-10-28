import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"
import { formatPrice } from "@/lib/format"
import Navbar from "@/components/Navbar"
import MobileNav from "@/components/MobileNav"
import DeleteListingButton from "@/components/DeleteListingButton"
import { Pencil, Home, CheckCircle, XCircle, Plus, ChevronLeft, ChevronRight } from "lucide-react"

export const dynamic = "force-dynamic"

// 1. SEO VA MAXFIYLIK (Shaxsiy sahifa qidiruvda chiqmasligi kerak)
export const metadata: Metadata = {
  title: "Mening e'lonlarim | Olsot Market",
  description: "Sizning shaxsiy e'lonlaringiz ro'yxati",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: { images: ["/logo.svg"] },
}

const PAGE_SIZE = 12

const statusMap: Record<string, { label: string; cls: string; icon: typeof Home }> = {
  PENDING: { label: "Ko'rikda", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400", icon: Home },
  ACTIVE: { label: "Faol", cls: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400", icon: CheckCircle },
  SOLD: { label: "Sotilgan", cls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400", icon: CheckCircle },
  EXPIRED: { label: "Muddati tugagan", cls: "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400", icon: XCircle },
  REJECTED: { label: "Rad etilgan", cls: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400", icon: XCircle },
}

interface PageProps {
  searchParams: Record<string, string | undefined>
}

export default async function MyListingsPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login?callbackUrl=/my-listings")

  const requestedPage = Number.parseInt(searchParams.page ?? "1", 10)
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const where = { userId: session.user.id }

  // 2. OPTIMALLASHTIRILGAN SO'ROV (Faqat kerakli ustunlarni yuklaymiz)
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        status: true,
        images: true,
        region: true,
        district: true,
      },
    }),
    prisma.listing.count({ where }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-10">
      <Navbar />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">Mening e&apos;lonlarim</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{total} ta e&apos;lon</p>
          </div>
          <Link href="/listings/create" className="h-10 px-4 bg-gradient-to-r from-[#0A7C4E] to-[#08623D] text-white text-sm font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-green-400/30 flex-shrink-0 transition-transform active:scale-95">
            <Plus className="h-4 w-4" /> Yangi e&apos;lon
          </Link>
        </div>

        {searchParams.created && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl text-sm text-green-700 dark:text-green-400 animate-in fade-in slide-in-from-top-2">
            E&apos;lon qabul qilindi. Moderatsiya tekshiruvidan so&apos;ng saytda ko&apos;rinadi.
          </div>
        )}

        {listings.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
            <Home className="h-12 w-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hali e&apos;lonlaringiz yo&apos;q</p>
            <Link href="/listings/create" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#0A7C4E] to-[#08623D] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" /> Birinchi e&apos;lonni qo&apos;shish
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {listings.map((l) => {
              const st = statusMap[l.status] || statusMap.PENDING
              const StIcon = st.icon
              return (
                <div key={l.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
                  <div className="flex gap-3.5">
                    {l.images?.[0] ? (
                      <Link href={`/listing/${l.id}`} className="flex-shrink-0 group">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800">
                          <Image 
                            src={l.images[0]} 
                            alt={l.title || "E'lon rasmi"} 
                            fill 
                            sizes="96px" 
                            className="object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="w-24 h-24 rounded-xl bg-green-50 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <Home className="h-8 w-8 text-green-300 dark:text-green-700" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/listing/${l.id}`} className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm leading-snug hover:text-[#0A7C4E] transition-colors">
                          {l.title || "Sarlavhasiz"}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 flex-shrink-0 ${st.cls}`}>
                          <StIcon className="h-3 w-3" /> {st.label}
                        </span>
                      </div>
                      <div className="text-base font-extrabold text-[#0A7C4E] dark:text-emerald-500 mt-1">
                        {/* XATO TUZATILDI: formatPrice endi (narx, valyuta) qabul qiladi */}
                        {formatPrice(l.price, l.currency || "UZS")}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {l.region}{l.district ? `, ${l.district}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <Link
                      href={`/edit-listing/${l.id}`}
                      className="flex-1 h-10 px-3 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                    >
                      <Pencil className="h-4 w-4" /> Tahrirlash
                    </Link>
                    <DeleteListingButton id={l.id} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link
              href={`/my-listings?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={`h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-1 border border-gray-200 dark:border-zinc-700 transition-colors ${page <= 1 ? "pointer-events-none opacity-40" : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
            >
              <ChevronLeft className="h-4 w-4" /> Oldingi
            </Link>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{page} / {totalPages}</span>
            <Link
              href={`/my-listings?page=${page + 1}`}
              aria-disabled={page >= totalPages}
              className={`h-10 px-4 rounded-xl text-sm font-semibold flex items-center gap-1 border border-gray-200 dark:border-zinc-700 transition-colors ${page >= totalPages ? "pointer-events-none opacity-40" : "bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}
            >
              Keyingi <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  )
}