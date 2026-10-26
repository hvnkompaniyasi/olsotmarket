import { ChevronDown } from "lucide-react"
import type { FilterKey } from "@/components/search-filter-types"

const FIELD_CLASS =
  "h-11 min-w-0 w-full rounded-xl border border-gray-200 bg-[#F8F9FA] px-2.5 text-[11px] font-medium text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15 sm:px-3 sm:text-sm"

interface SearchFilterSelectProps {
  id: FilterKey
  label: string
  placeholder?: string
  value: string
  options: { id: string; name: string }[]
  onChange: (value: string) => void
  disabled?: boolean
}

export function SearchFilterSelect({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
  disabled,
}: SearchFilterSelectProps) {
  return (
    <label htmlFor={id} className="block min-w-0 space-y-1.5">
      <span className="block truncate text-[11px] font-semibold text-gray-700">{label}</span>
      <span className="relative block min-w-0">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className={`${FIELD_CLASS} appearance-none pr-7 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <option value="">{placeholder ?? label}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
      </span>
    </label>
  )
}
