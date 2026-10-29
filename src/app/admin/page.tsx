import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import {
  Building2, Clock, CheckCircle2, Users, ShieldAlert, CalendarDays, ArrowRight, Activity, TrendingUp
} from "lucide-react"

export const metadata: Metadata = {
  title: "Boshqaruv Paneli | Olsot Market",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

const numberFormatter = new Intl.NumberFormat("uz-UZ")
const dateFormatter = new Intl.DateTimeFormat("uz-UZ", { dateStyle: "medium", timeStyle: "short" })

const statCards = [
  { label: "Jami e'lonlar", icon: Building2, color: "from-blue-500 to-blue-600" },
  { label: "Kutilayotgan", icon: Clock, color: "from-amber-400 to-amber-500" },
  { label: "Faol e'lonlar", icon: CheckCircle2, color: "from-emerald-500 to-emerald-600" },
  { label: "Foydalanuvchilar", icon: Users, color: "from-purple-500 to-purple-600" },
  { label: "Bloklanganlar", icon: ShieldAlert, color: "from-red-500 to-red-600" },
  { label: "Bugungi e'lonlar", icon: CalendarDays, color: "from-cyan-500 to-cyan-600" },
]

export default async function AdminDashboardPage() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    totalListings, pendingListingsCount, activeListings, totalUsers, bannedUsers, todayListings, pendingListings, recentLogs,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.listing.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.listing.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, title: true, region: true, createdAt: true } }),
    prisma.adminLog.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, action: true, createdAt: true, admin: { select: { name: true, email: true } } } }),
  ])

  const statValues = [totalListings, pendingListingsCount, activeListings, totalUsers, bannedUsers, todayListings]

  // Grafik uchun soxta ma'lumotlar (keyinchalik haqiqiy ma'lumotlar bilan almashtirish mumkin)
  const chartData = [40, 70, 45, 90, 65, 85, 100];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. STATISTIKA KARTALARI (Zamonaviy gradientlar bilan) */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {statCards.map(({ label, icon: Icon, color }, index) => (
          <article 
            key={label} 
            className="group relative overflow-hidden flex flex-col justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full transition-transform duration-500 group-hover:scale-110`}></div>
            <div className="flex items-center justify-between z-10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
              <div className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-gray-800 z-10">{numberFormatter.format(statValues[index])}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        
        {/* 2. GRAFIK (Chap tarafda, katta) */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Faollik dinamikasi</h2>
              <p className="text-sm text-gray-500">Oxirgi 7 kunlik e'lonlar statistikasi</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          
          {/* CSS yordamida chizilgan grafik */}
          <div className="flex items-end justify-between h-56 gap-2 mt-4">
            {chartData.map((h, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-emerald-100 rounded-t-lg relative group-hover:bg-emerald-300 transition-colors duration-300" 
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    {h} ta e'lon
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">Kun {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SO'NGGI KUTILAYOTGAN E'LONLAR (O'ng tarafda) */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" /> Kutilayotgan
            </h2>
            <Link href="/admin/listings?status=PENDING" className="text-xs font-semibold text-emerald-600 hover:underline">
              Barchasi
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingListings.map((listing) => (
              <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center group">
                <div className="min-w-0 pr-4">
                  <p className="truncate font-semibold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors">{listing.title || "—"}</p>
                  <p className="text-xs text-gray-500 mt-1">{listing.region}</p>
                </div>
                <span className="text-[10px] font-medium bg-amber-50 text-amber-600 px-2 py-1 rounded-md shrink-0">
                  {dateFormatter.format(listing.createdAt).split(',')[0]}
                </span>
              </div>
            ))}
            {pendingListings.length === 0 && <p className="p-8 text-center text-sm text-gray-500">E'lonlar yo'q</p>}
          </div>
        </div>
      </section>

      {/* 4. SO'NGGI AUDIT LOGLAR VA TEZKOR HAVOLALAR */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" /> So'nggi harakatlar
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <div>
                    <p className="truncate font-semibold text-gray-800 text-sm">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.admin.name || log.admin.email || "Admin"}</p>
                  </div>
                </div>
                <time className="shrink-0 text-[11px] font-medium text-gray-400">{dateFormatter.format(log.createdAt).split(',')[1]}</time>
              </div>
            ))}
            {recentLogs.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Loglar mavjud emas</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-center bg-gradient-to-br from-emerald-50 to-white">
          <h2 className="mb-2 text-lg font-bold text-gray-800">Tezkor havolalar</h2>
          <p className="text-sm text-gray-500 mb-6">Admin sifatida tez-tez ishlatiladigan bo'limlar</p>
          <div className="flex flex-col gap-3">
            <Link href="/admin/listings?status=PENDING" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700 group-hover:text-emerald-700">Moderatsiya</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/admin/users" className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-emerald-500 hover:shadow-md transition-all group">
              <span className="font-semibold text-gray-700 group-hover:text-emerald-700">Foydalanuvchilar</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}