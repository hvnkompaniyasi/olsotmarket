import { Bolt, Flame, Droplets, Waves } from "lucide-react"
import type { Listing } from "@prisma/client"

type Utility = {
  label: string
  available: boolean
  icon: typeof Flame
}

export default function ListingUtilities({ listing }: { listing: Listing }) {
  const utilities: Utility[] = [
    { label: "Tabiiy gaz", available: listing.hasGas, icon: Flame },
    { label: "Suv (I/S)", available: listing.hasWater, icon: Droplets },
    { label: "Elektr toki", available: listing.hasElectricity, icon: Bolt },
    ...(listing.hasSewage === null
      ? []
      : [{ label: "Kanalizatsiya", available: listing.hasSewage, icon: Waves }]),
  ]

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-gray-900">Kommunal xizmatlar</h2>
        {listing.utilitiesCondition && (
          <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
            {listing.utilitiesCondition}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {utilities.map(({ label, available, icon: Icon }) => (
          <div
            key={label}
            className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/80 p-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-gray-800">{label}</span>
                <span className="block text-[10px] text-gray-500">{available ? "Mavjud" : "Mavjud emas"}</span>
              </span>
            </div>
            <span
              role="img"
              aria-label={available ? "Bor" : "Yo'q"}
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
              }`}
            >
              {available ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
