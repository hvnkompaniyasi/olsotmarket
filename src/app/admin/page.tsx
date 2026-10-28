import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import {
  Building2, Clock, CheckCircle2, Users, ShieldAlert, CalendarDays, ArrowRight, Activity
} from "lucide-react"

// 1. SEO VA MAXFIYLIK
export const metadata: Metadata = {
  title: "Boshqaruv Paneli | Olsot Market",
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = "force-dynamic"

const numberFormatter = new Intl.NumberFormat("uz-UZ")
const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
  dateStyle: "medium",
  timeStyle: "short",
})

const statCards = [
  { label: "Jami e'lonlar", icon: Building2, color: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" },
  { label: "Kutilayotgan", icon: Clock, color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" },
  { label: "Faol e'lonlar", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
  { label: "Foydalanuvchilar", icon: Users, color: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400" },
  { label: "Bloklanganlar", icon: ShieldAlert, color: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400" },
  { label: "Bugungi e'lonlar", icon: CalendarDays, color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400" },
]

const quickLinks = [
  { href: "/admin/listings?status=PENDING", label: "Moderatsiya", icon: Clock },
  { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
  { href: "/admin/logs", label: "Audit Loglar", icon: Activity },
]

export default async function AdminDashboardPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // 2. OPTIMALLASHTIRILGAN SO'ROVLAR
  const [
    totalListings,
    pendingListingsCount,
    activeListings,
    totalUsers,
    bannedUsers,
    todayListings,
    pendingListings,
    recentLogs,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.listing.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.listing.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, region: true, createdAt: true },
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        action: true,
        createdAt: true,
        admin: { select: { name: true, email: true } }, // include emas, select!
      },
    }),
  ])

  const statValues = [
    totalListings,
    pendingListingsCount,
    activeListings,
    totalUsers,
    bannedUsers,
    todayListings,
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* STATISTIKA KARTALARI */}
      <section aria-label="Asosiy statistika" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map(({ label, icon: Icon, color }, index) => (
          <article key={label} className={`flex flex-col justify-between rounded-2xl border border-gray-100 p-4 shadow-sm dark:border-zinc-800 ${color}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</p>
              <Icon className="h-5 w-5 opacity-70" />
            </div>
            <p className="mt-3 text-2xl font-extrabold">{numberFormatter.format(statValues[index])}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        
        {/* SO'NGGI KUTILAYOTGAN E'LONLAR */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-zinc-800">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              So&apos;nggi kutilayotgan e&apos;lonlar
            </h2>
            <Link href="/admin/listings?status=PENDING" className="text-xs font-semibold text-[#0A7C4E] hover:underline dark:text-emerald-500">
              Barchasi
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-zinc-800/50 dark:text-gray-400">
                <tr>
                  <th className="p-3 font-semibold">Sarlavha</th>
                  <th className="p-3 font-semibold">Hudud</th>
                  <th className="p-3 font-semibold">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {pendingListings.map((listing) => (
                  <tr key={listing.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    <td className="max-w-[200px] truncate p-3 font-medium text-gray-900 dark:text-white">
                      {listing.title || "—"}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">{listing.region}</td>
                    <td className="whitespace-nowrap p-3 text-xs text-gray-500">
                      {dateFormatter.format(listing.createdAt)}
                    </td>
                  </tr>
                ))}
                {pendingListings.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      Hozircha kutilayotgan e&apos;lonlar yo&apos;q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SO'NGGI AUDIT LOGLAR */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-gray-100 p-4 dark:border-zinc-800">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              So&apos;nggi admin harakatlari
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900 dark:text-white text-sm">{log.action}</p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {log.admin.name || log.admin.email || "Noma'lum admin"}
                  </p>
                </div>
                <time className="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
                  {dateFormatter.format(log.createdAt)}
                </time>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Audit loglar mavjud emas</p>
            )}
          </div>
        </div>
      </section>

      {/* TEZKOR HAVOLALAR */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-bold text-gray-900 dark:text-white">Tezkor havolalar</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A7C4E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#086339] hover:-translate-y-0.5 active:scale-95"
            >
              <Icon className="h-4 w-4" />
              {label}
              <ArrowRight className="h-3 w-3 ml-1 opacity-70" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}