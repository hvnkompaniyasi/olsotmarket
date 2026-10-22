"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Search, MapPin, Plus, ShieldCheck } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* Gradient blob'lar */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-300/30 blur-3xl pointer-events-none" />
      <div className="absolute top-32 -left-24 w-64 h-64 rounded-full bg-teal-300/25 blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 pt-8 pb-6">
        <div className="glass-pill inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold text-[#0A7C4E] dark:text-emerald-400 mb-4">
          <ShieldCheck className="h-3.5 w-3.5" />
          O'zbekiston bo'ylab ishonchli e'lonlar
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
          Orzuingizdagi uy
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A7C4E] to-emerald-500">
            bir masofada
          </span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-md">
          Minglab tasdiqlangan e'lonlar — xarita, filtr va bir toxtda qidiruv bilan
        </p>

        {/* Glass qidiruv panel */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(q.trim() ? `/listings?q=${encodeURIComponent(q.trim())}` : "/listings");
          }}
          className="glass mt-5 flex items-center gap-2 p-2 rounded-2xl shadow-[0_8px_30px_rgba(10,124,78,0.10)]"
        >
          <Search className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Hudud, manzil yoki sarlavha..."
            className="flex-1 h-10 bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="h-10 px-5 bg-[#0A7C4E] hover:bg-[#086339] text-white rounded-xl text-sm font-bold transition-colors"
          >
            Qidirish
          </button>
        </form>

        {/* Tez tugmalar */}
        <div className="flex gap-2 mt-3">
          <Link
            href="/map"
            className="glass flex-1 h-11 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-1.5"
          >
            <MapPin className="h-4 w-4 text-[#0A7C4E]" /> Xaritada ko'rish
          </Link>
          <Link
            href="/listings/create"
            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#0A7C4E] to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_8px_24px_rgba(10,124,78,0.35)]"
          >
            <Plus className="h-4 w-4" /> E'lon qo'shish — bepul
          </Link>
        </div>
      </div>
    </section>
  );
}
