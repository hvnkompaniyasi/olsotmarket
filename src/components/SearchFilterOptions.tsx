"use client"

import { ArrowUpDown } from "lucide-react"
import { SearchFilterSelect } from "@/components/SearchFilterSelect"
import type { FilterKey, FilterValues } from "@/components/search-filter-types"

const SORT_OPTIONS = [
  { id: "newest", name: "Eng yangi e'lonlar" },
  { id: "price-asc", name: "Narx: avval arzonlari" },
  { id: "price-desc", name: "Narx: avval qimmatlari" },
]

interface SearchFilterOptionsProps {
  values: FilterValues
  setField: (key: FilterKey, value: string) => void
}

export default function SearchFilterOptions({ values, setField }: SearchFilterOptionsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700">
          <ArrowUpDown className="h-3.5 w-3.5 text-emerald-700" />
          Saralash tartibi
        </span>
        <SearchFilterSelect
          id="sortBy"
          label="Saralash"
          value={values.sortBy}
          options={SORT_OPTIONS}
          onChange={(value) => setField("sortBy", value || "newest")}
        />
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-[11px] font-semibold text-gray-700">Xonalar soni</legend>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {["", "1", "2", "3", "4+"].map((room, index) => {
            const selected = values.rooms === room
            const label = index === 0 ? "Barchasi" : room
            return (
              <button
                key={room || "all"}
                type="button"
                aria-pressed={selected}
                onClick={() => setField("rooms", selected ? "" : room)}
                className={`min-w-0 rounded-xl py-2.5 text-[10px] font-semibold transition sm:text-xs ${
                  selected
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span className="block truncate">{label}</span>
              </button>
            )
          })}
        </div>
      </fieldset>
    </>
  )
}
