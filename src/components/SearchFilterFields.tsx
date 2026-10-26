"use client"

import { DEAL_TYPES, PROPERTY_CATEGORIES, REGIONS, getDistricts } from "@/lib/locations"
import type { FilterKey, FilterValues } from "@/components/search-filter-types"
import { SearchFilterSelect } from "@/components/SearchFilterSelect"
import { Search } from "lucide-react"

const FIELD_CLASS =
  "h-11 min-w-0 w-full rounded-xl border border-gray-200 bg-[#F8F9FA] px-2.5 text-[11px] font-medium text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 sm:px-3 sm:text-sm"

interface SearchFilterFieldsProps {
  values: FilterValues
  setField: (key: FilterKey, value: string) => void
  setRegion: (value: string) => void
}

export default function SearchFilterFields({
  values,
  setField,
  setRegion,
}: SearchFilterFieldsProps) {
  return (
    <div className="space-y-4">
      <label htmlFor="search-query" className="block space-y-1.5">
        <span className="block text-[11px] font-semibold text-gray-700">
          Kalit so&apos;z yoki sarlavha
        </span>
        <span className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="search-query"
            type="search"
            value={values.q}
            onChange={(event) => setField("q", event.target.value)}
            placeholder="Manzil, hudud yoki e'lon nomi"
            className={`${FIELD_CLASS} rounded-full pl-10 pr-4`}
          />
        </span>
      </label>

      <fieldset className="space-y-1.5">
        <legend className="text-[11px] font-semibold text-gray-700">Bitim turi</legend>
        <div className="grid grid-cols-3 gap-2">
          {DEAL_TYPES.map((deal) => {
            const selected = values.type === deal.id
            return (
              <button
                key={deal.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setField("type", selected ? "" : deal.id)}
                className={`min-w-0 rounded-xl border px-1.5 py-2.5 text-[11px] font-semibold transition sm:px-3 sm:text-sm ${
                  selected
                    ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                    : "border-gray-200 bg-[#F8F9FA] text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="block truncate">{deal.name}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-3">
        <SearchFilterSelect
          id="category"
          label="Turkum"
          placeholder="Barcha turkumlar"
          value={values.category}
          options={PROPERTY_CATEGORIES}
          onChange={(value) => setField("category", value)}
        />
        <SearchFilterSelect
          id="region"
          label="Hudud"
          placeholder="Barcha hududlar"
          value={values.region}
          options={REGIONS.map(({ name }) => ({ id: name, name }))}
          onChange={setRegion}
        />
        <SearchFilterSelect
          id="district"
          label="Tuman"
          placeholder={values.region ? "Barcha tumanlar" : "Avval hudud tanlang"}
          value={values.district}
          options={getDistricts(values.region).map((name) => ({ id: name, name }))}
          onChange={(value) => setField("district", value)}
          disabled={!values.region}
        />
        <label htmlFor="minPrice" className="block min-w-0 space-y-1.5">
          <span className="block text-[11px] font-semibold text-gray-700">Narxdan (so&apos;m)</span>
          <input
            id="minPrice"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.minPrice}
            onChange={(event) => setField("minPrice", event.target.value)}
            placeholder="Chegara yo'q"
            className={FIELD_CLASS}
          />
        </label>
        <label htmlFor="maxPrice" className="block min-w-0 space-y-1.5">
          <span className="block text-[11px] font-semibold text-gray-700">Narxgacha (so&apos;m)</span>
          <input
            id="maxPrice"
            type="number"
            min={0}
            inputMode="numeric"
            value={values.maxPrice}
            onChange={(event) => setField("maxPrice", event.target.value)}
            placeholder="Chegara yo'q"
            className={FIELD_CLASS}
          />
        </label>
      </div>
    </div>
  )
}
