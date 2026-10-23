"use client"
import { BarChart, Crown, TrendingUp } from "lucide-react"

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white pb-24">
      {/* Admin Sidebar */}
      <aside className="fixed top-0 left-0 w-64 h-full bg-zinc-900/80 border-r border-zinc-800 backdrop-blur-xl p-6 z-40 hidden lg:block">
        <div className="flex items-center gap-2 mb-8">
          <Crown className="h-6 w-6 text-emerald-400" />
          <h2 className="text-lg font-extrabold text-emerald-400">Admin</h2>
        </div>
      </aside>

      <main className="lg:ml-64 px-6 py-8 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <BarChart className="h-8 w-8 text-emerald-400" /> Admin Statistika
            <Crown className="h-5 w-5 text-emerald-400" />
          </h1>
          <p className="text-zinc-400 mt-2">Olsot Market platformasi bo'yicha umumiy ma'lumotlar — 14 kunlik</p>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wide">Jami E'lon</div>
            <div className="text-3xl font-extrabold text-white mt-1">1</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +0%</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wide">Foydalanuvchi</div>
            <div className="text-3xl font-extrabold text-white mt-1">1</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +0%</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wide">Xabar</div>
            <div className="text-3xl font-extrabold text-white mt-1">0</div>
            <div className="text-xs text-zinc-600 mt-2">So'nggi 14 kun</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="text-xs text-zinc-500 uppercase font-bold tracking-wide">Sevimli</div>
            <div className="text-3xl font-extrabold text-white mt-1">0</div>
            <div className="text-xs text-zinc-600 mt-2">So'nggi 14 kun</div>
          </div>
        </div>

        {/* 14-day simple SVG chart */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-zinc-300 mb-4">14 kun bo'yicha e'lonlar (oddiy SVG)</h3>
          <svg viewBox="0 0 400 120" className="w-full h-auto" aria-label="14 kunlik e'lonlar grafigi">
            <rect x="0" y="0" width="400" height="120" fill="#18181b" rx="8" />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => {
              const h = Math.max(10, Math.random() * 80 + 10)
              return (
                <rect key={i} x={i * 26 + 4} y={120 - h} width="20" height={h} fill="#0A7C4E" rx="3" opacity={0.8 + Math.random() * 0.2} />
              )
            })}
            <text x="200" y="115" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="sans-serif">Kunlar (14)</text>
          </svg>
        </div>

        {/* Last 5 listings */}
        <div className="mt-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-zinc-300 mb-4">Oxirgi 5 e'lon</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xs font-extrabold">5X</div>
              <div>
                <div className="text-sm font-bold text-white">5-xonali kvartira sotiladi</div>
                <div className="text-xs text-zinc-500">Andijon — $43,000</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
