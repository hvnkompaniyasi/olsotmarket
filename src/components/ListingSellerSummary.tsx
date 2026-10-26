import type { Listing, User } from "@prisma/client"
import { ChevronRight } from "lucide-react"

interface ListingSellerSummaryProps {
  listing: Listing & { user: Pick<User, "name"> }
}

export default function ListingSellerSummary({ listing }: ListingSellerSummaryProps) {
  const sellerName = listing.user.name?.trim() || "Anonim"
  const initial = sellerName.charAt(0).toUpperCase()
  const postedDate = new Intl.DateTimeFormat("uz-UZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(listing.createdAt)

  return (
    <section className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-800 text-lg font-bold text-white after:absolute after:-bottom-0.5 after:-right-0.5 after:grid after:h-4 after:w-4 after:place-items-center after:rounded-full after:border-2 after:border-white after:bg-emerald-800 after:text-[9px] after:content-['✓']">
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="truncate text-sm font-bold text-gray-900">{sellerName}</h2>
          <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700">
            E&apos;lon egasi
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">Mulk egasi</p>
        <p className="mt-0.5 truncate text-[11px] text-gray-400">E&apos;lon joylangan: {postedDate}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" aria-hidden="true" />
    </section>
  )
}
