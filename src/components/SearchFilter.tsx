"use client"

import { type FormEvent, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Filter, RotateCcw, Search } from "lucide-react"
import SearchFilterFields from "@/components/SearchFilterFields"
import SearchFilterOptions from "@/components/SearchFilterOptions"
import {
  EMPTY_FILTERS,
  FILTER_KEYS,
  type FilterKey,
  type FilterValues,
} from "@/components/search-filter-types"

function readFilters(params: URLSearchParams): FilterValues {
  return {
    q: params.get("q") ?? "",
    type: params.get("type") ?? "",
    category: params.get("category") ?? "",
    region: params.get("region") ?? "",
    district: params.get("district") ?? "",
    minPrice: params.get("minPrice") ?? "",
    maxPrice: params.get("maxPrice") ?? "",
    rooms: params.get("rooms") ?? "",
    sortBy: params.get("sortBy") ?? "newest",
  }
}

export default function SearchFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const paramsString = searchParams.toString()
  const [draft, setDraft] = useState(() => ({
    paramsString,
    values: readFilters(new URLSearchParams(paramsString)),
  }))
  const values =
    draft.paramsString === paramsString
      ? draft.values
      : readFilters(new URLSearchParams(paramsString))

  function updateValues(update: (current: FilterValues) => FilterValues) {
    setDraft({ paramsString, values: update(values) })
  }

  function setField(key: FilterKey, value: string) {
    updateValues((current) => ({ ...current, [key]: value }))
  }

  function setRegion(value: string) {
    updateValues((current) => ({ ...current, region: value, district: "" }))
  }

  function apply(next: FilterValues) {
    const params = new URLSearchParams(paramsString)
    FILTER_KEYS.forEach((key) => {
      const value = next[key].trim()
      if (value && !(key === "sortBy" && value === "newest")) params.set(key, value)
      else params.delete(key)
    })
    params.delete("page")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = { ...values }
    if (next.minPrice && next.maxPrice && Number(next.minPrice) > Number(next.maxPrice)) {
      ;[next.minPrice, next.maxPrice] = [next.maxPrice, next.minPrice]
    }
    updateValues(() => next)
    apply(next)
  }

  function reset() {
    updateValues(() => EMPTY_FILTERS)
    apply(EMPTY_FILTERS)
  }

  const activeCount = FILTER_KEYS.filter(
    (key) => values[key].trim() && !(key === "sortBy" && values[key] === "newest")
  ).length

  return (
    <section className="pb-6">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_16px_40px_-18px_rgba(15,23,42,0.22)]"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Filter className="h-4 w-4" />
            </span>
            <h2 className="truncate text-base font-bold tracking-tight text-gray-900">
              Qidiruv va filtr
            </h2>
          </div>
          {activeCount > 0 && (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              {activeCount} ta faol
            </span>
          )}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <SearchFilterFields values={values} setField={setField} setRegion={setRegion} />
          <SearchFilterOptions values={values} setField={setField} />
        </div>

        <div className="flex gap-2.5 border-t border-gray-100 bg-white p-4 sm:gap-3 sm:px-5">
          <button
            type="button"
            onClick={reset}
            disabled={activeCount === 0}
            className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            Tozalash
          </button>
          <button
            type="submit"
            className="flex min-h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white shadow-[0_8px_20px_-8px_rgba(15,157,88,0.65)] transition hover:bg-emerald-800 active:scale-[0.98] sm:text-sm"
          >
            <Search className="h-4 w-4 shrink-0" />
            Qidirish
          </button>
        </div>
      </form>
    </section>
  )
}
