import Link from "next/link"
import { Building2, Home, MapPin, Plus, Trees, Store } from "lucide-react"

const CATEGORIES = [
  { id: "APARTMENT", label: "Kvartiralar", icon: Building2 },
  { id: "HOUSE", label: "Hovli uylar", icon: Home },
  { id: "LAND", label: "Yerlar", icon: Trees },
  { id: "OFFICE", label: "Tijoriy", icon: Store },
]

interface CategoriesProps {
  selectedCategory?: string
}

export default function Categories({ selectedCategory = "APARTMENT" }: CategoriesProps) {
  return (
    <section className="pb-1">
      <h2 className="sr-only">Mulk turi bo&apos;yicha qidirish</h2>
      <div className="no-scrollbar flex gap-2 overflow-x-auto py-1">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const active = selectedCategory === category.id
          return (
            <Link
              key={category.id}
              href={`/listings?category=${category.id}`}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-95 ${
                active
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-white text-gray-700 shadow-[0_2px_8px_rgba(17,24,39,0.04)] hover:bg-slate-50"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-600"}`} />
              {category.label}
            </Link>
          )
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/map"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-medium text-gray-800 shadow-[0_2px_10px_rgba(17,24,39,0.04)] transition active:scale-[0.98]"
        >
          <MapPin className="h-5 w-5 text-emerald-800" />
          Xaritada ko&apos;rish
        </Link>
        <Link
          href="/listings/create"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 text-sm font-semibold text-emerald-800 shadow-[0_2px_8px_rgba(0,106,57,0.06)] transition active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          E&apos;lon qo&apos;shish
        </Link>
      </div>
    </section>
  )
}
