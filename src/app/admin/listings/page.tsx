import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-guard"
import ListingModeration from "./ListingModeration"

export const dynamic = "force-dynamic"

export default async function AdminListingsPage() {
  await requireAdmin()

  const listings = await prisma.listing.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: {
      id: true,
      title: true,
      region: true,
      district: true,
      price: true,
      currency: true,
      createdAt: true,
      images: true,
      isPremium: true,
      user: { select: { name: true, phone: true } },
    },
  })

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-zinc-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7">
          <p className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">Moderatsiya</p>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Kutilayotgan e’lonlar</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Ko‘rib chiqish uchun {listings.length === 100 ? "oxirgi 100 ta e’lon ko‘rsatildi" : `${listings.length} ta e’lon topildi`}.
          </p>
        </header>
        <ListingModeration
          listings={listings.map((listing) => ({
            ...listing,
            createdAt: listing.createdAt.toISOString(),
          }))}
        />
      </div>
    </main>
  )
}
