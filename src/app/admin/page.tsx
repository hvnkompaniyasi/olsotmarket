import Link from "next/link"
import { BarChart3, CheckCircle2, Clock3, Home, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"

const cards = [
  { key: "totalListings", label: "Jami e'lonlar", icon: Home, color: "text-blue-600 bg-blue-50" },
  { key: "pendingListings", label: "Tasdiq kutmoqda", icon: Clock3, color: "text-amber-600 bg-amber-50" },
  { key: "activeListings", label: "Faol e'lonlar", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  { key: "totalUsers", label: "Jami foydalanuvchilar", icon: Users, color: "text-violet-600 bg-violet-50" },
] as const

export default async function AdminDashboardPage() {
  const [totalListings, pendingListings, activeListings, totalUsers] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
  ])
  const stats = { totalListings, pendingListings, activeListings, totalUsers }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-zinc-950 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              <BarChart3 className="h-4 w-4" /> Olsot Market boshqaruvi
            </p>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Admin dashboard</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Platformaning joriy ko‘rsatkichlari</p>
          </div>
          <Link
            href="/admin/listings"
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            E’lonlarni moderatsiya qilish
          </Link>
        </header>

        <section aria-label="Platforma statistikasi" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ key, label, icon: Icon, color }) => (
            <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{label}</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                {stats[key].toLocaleString("uz-UZ")}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
