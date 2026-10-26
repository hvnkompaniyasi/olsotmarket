"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ShieldCheck, SlidersHorizontal } from "lucide-react"
import SearchFilter from "@/components/SearchFilter"

export default function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  return (
    <section className="pb-4">
      <div className="pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-semibold text-emerald-800">
          <ShieldCheck className="h-3.5 w-3.5" />
          Ishonchli va kafolatlangan bozor
        </div>
        <h1 className="mt-2 max-w-xl text-[26px] font-bold leading-8 tracking-tight text-gray-950 sm:text-4xl sm:leading-tight">
          Orzuingizdagi uy bir masofada
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Minglab tasdiqlangan e&apos;lonlar
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            const search = query.trim()
            router.push(search ? `/listings?q=${encodeURIComponent(search)}` : "/listings")
          }}
          className="mt-5 flex items-center gap-2.5"
        >
          <label className="flex h-13 min-w-0 flex-1 items-center gap-3 rounded-full bg-white px-4 shadow-[0_4px_16px_-2px_rgba(17,24,39,0.05),0_2px_6px_-1px_rgba(17,24,39,0.03)] transition focus-within:ring-2 focus-within:ring-emerald-600/20">
            <Search className="h-5 w-5 shrink-0 text-emerald-800" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hudud, manzil yoki sarlavha..."
              aria-label="E'lon qidirish"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              aria-label="Qidirish"
              className="sr-only"
            >
              Qidirish
            </button>
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-label={filtersOpen ? "Filtrlarni yopish" : "Filtrlarni ochish"}
            aria-expanded={filtersOpen}
            className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-[0_4px_16px_-2px_rgba(17,24,39,0.05),0_2px_6px_-1px_rgba(17,24,39,0.03)] transition active:scale-95 ${
              filtersOpen ? "ring-2 ring-emerald-700/20" : ""
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>
        </form>
      </div>

      {filtersOpen && (
        <div className="pt-3">
          <SearchFilter />
        </div>
      )}

    </section>
  )
}
