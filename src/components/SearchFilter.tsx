"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Home, MapPin, RotateCcw, Search, Wallet } from "lucide-react"
import { DEAL_TYPES, PROPERTY_CATEGORIES, REGIONS, getDistricts } from "@/lib/locations"

const FILTER_KEYS = ["type", "category", "region", "district", "minPrice", "maxPrice"] as const

type FilterKey = (typeof FILTER_KEYS)[number]
type FilterValues = Record<FilterKey, string>

const EMPTY_FILTERS: FilterValues = {
  type: "",
  category: "",
  region: "",
  district: "",
  minPrice: "",
  maxPrice: "",
}

function readFilters(params: URLSearchParams): FilterValues {
  return {
    type: params.get("type") ?? "",
    category: params.get("category") ?? "",
    region: params.get("region") ?? "",
    district: params.get("district") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
  }
}

const selectClass =
  "w-full h-11 pl-10 pr-8 bg-white/90 dark:bg-zinc-900 border-2 border-white/70 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-100 outline-none appearance-none cursor-pointer focus:border-green-400 focus:ring-4 focus:ring-green-400/20 transition-all"

const inputClass =
  "w-full h-11 pl-10 pr-3 bg-white/90 dark:bg-zinc-900 border-2 border-white/70 dark:border-zinc-700 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-400/20 transition-all"

const iconClass =
  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none z-10"

export default function SearchFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const paramsString = searchParams.toString()
  const [values, setValues] = useState<FilterValues>(() =>
    readFilters(new URLSearchParams(paramsString))
  )

  useEffect(() => {
    setValues(readFilters(new URLSearchParams(paramsString)))
  }, [paramsString])

  function apply(next: FilterValues) {
    const params = new URLSearchParams(paramsString)
    FILTER_KEYS.forEach((key) => {
      const value = next[key].trim()
      if (value) params.set(key, value)
      else params.delete(key)
    })
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  function setField(key: FilterKey, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = { ...values }
    if (next.minPrice && next.maxPrice && Number(next.minPrice) > Number(next.maxPrice)) {
      const min = next.minPrice
      next.minPrice = next.maxPrice
      next.maxPrice = min
    }
    setValues(next)
    apply(next)
  }

  function reset() {
    setValues(EMPTY_FILTERS)
    apply(EMPTY_FILTERS)
  }

  const activeCount = FILTER_KEYS.filter((key) => values[key].trim() !== "").length

  return (
    <section className="pb-6">
      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-3 sm:p-4 shadow-[0_8px_30px_rgba(10,124,78,0.08)]"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="relative">
            <Home className={iconClass} />
            <select
              aria-label="Bitim turi"
              value={values.type}
              onChange={(e) => setField("type", e.target.value)}
              className={selectClass}
            >
              <option value="">Barcha bitimlar</option>
              {DEAL_TYPES.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Home className={iconClass} />
            <select
              aria-label="Kategoriya"
              value={values.category}
              onChange={(e) => setField("category", e.target.value)}
              className={selectClass}
            >
              <option value="">Barcha kategoriyalar</option>
              {PROPERTY_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className={iconClass} />
            <select
              aria-label="Viloyat"
              value={values.region}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, region: e.target.value, district: "" }))
              }
              className={selectClass}
            >
              <option value="">Barcha viloyatlar</option>
              {REGIONS.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className={iconClass} />
            <select
              aria-label="Tuman"
              value={values.district}
              onChange={(e) => setField("district", e.target.value)}
              disabled={!values.region}
              className={`${selectClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <option value="">
                {values.region ? "Barcha tumanlar" : "Avval viloyat tanlang"}
              </option>
              {getDistricts(values.region).map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5">
          <div className="relative">
            <Wallet className={iconClass} />
            <input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="Narxdan"
              placeholder="Narxdan (so'm)"
              value={values.minPrice}
              onChange={(e) => setField("minPrice", e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="relative">
            <Wallet className={iconClass} />
            <input
              type="number"
              min={0}
              inputMode="numeric"
              aria-label="Narxgacha"
              placeholder="Narxgacha (so'm)"
              value={values.maxPrice}
              onChange={(e) => setField("maxPrice", e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="h-11 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-green-400/25 transition-colors"
          >
            <Search className="h-4 w-4" /> Qidirish
          </button>

          <button
            type="button"
            onClick={reset}
            disabled={activeCount === 0}
            className="h-11 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-2 hover:border-[#0A7C4E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Tozalash
          </button>
        </div>

        {activeCount > 0 && (
          <p className="mt-2.5 text-[11px] font-semibold text-[#0A7C4E] dark:text-emerald-400">
            {activeCount} ta filtr faol
          </p>
        )}
      </form>
    </section>
  )
}
