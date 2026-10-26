import { Armchair, CarFront, Building2 } from "lucide-react"
import type { Listing } from "@prisma/client"
import ListingDescription from "@/components/ListingDescription"
import ListingUtilities from "@/components/ListingUtilities"

interface ListingFactsProps {
  listing: Listing
}

export default function ListingFacts({ listing }: ListingFactsProps) {
  const amenities = [
    listing.parking ? { label: "Avtoturargoh", icon: CarFront } : null,
    listing.furniture ? { label: "Mebel", icon: Armchair } : null,
    listing.elevator ? { label: "Lift", icon: Building2 } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  const extraDetails = [
    { label: "Yashash maydoni", value: listing.livingArea ? `${listing.livingArea} m²` : null },
    { label: "Sanuzel", value: listing.bathroom !== null ? `${listing.bathroom} ta` : null },
    { label: "Maqsadi", value: listing.purpose },
    { label: "Bino turi", value: listing.buildingType },
    { label: "Elektr quvvati", value: listing.electricityPower !== null ? `${listing.electricityPower} kW` : null },
    { label: "Kirish joyi", value: listing.entrance },
    { label: "Depozit", value: listing.deposit !== null ? `${listing.deposit.toLocaleString("ru-RU")} ${listing.currency}` : null },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value))

  return (
    <div className="space-y-3.5">
      <ListingUtilities listing={listing} />

      {listing.description && (
        <ListingDescription text={listing.description} />
      )}

      {amenities.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-base font-bold text-gray-900">Qulayliklar</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {amenities.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs text-gray-700"
              >
                <Icon className="h-3.5 w-3.5 text-emerald-700" />
                {label}
              </span>
            ))}
          </div>
        </section>
      )}

      {extraDetails.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-base font-bold text-gray-900">Qo&apos;shimcha ma&apos;lumotlar</h2>
          <dl className="grid grid-cols-2 gap-2.5">
            {extraDetails.map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-gray-50 px-3 py-2">
                <dt className="text-[10px] text-gray-500">{label}</dt>
                <dd className="mt-0.5 break-words text-xs font-semibold text-gray-800">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}
