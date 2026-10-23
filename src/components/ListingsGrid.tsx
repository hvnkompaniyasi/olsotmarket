import ListingCard from "./ListingCard";
import { DEAL_TYPES } from "@/lib/locations";
import type { ListingSummary } from "@/lib/listing-cache";

interface ListingsGridProps {
  listings: ListingSummary[];
  total: number;
}

export default function ListingsGrid({ listings, total }: ListingsGridProps) {
  return (
    <div className="pb-4">
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
          <p className="text-3xl mb-2">🏠</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Hech narsa topilmadi</p>
          <p className="text-xs text-gray-400 mt-1">Filtrlarni o'zgartirib ko'ring</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              id={l.id}
              title={l.title}
              price={l.price}
              location={[l.region, l.district].filter(Boolean).join(", ")}
              rooms={l.rooms || 0}
              area={l.area || 0}
              image={l.images?.[0] || ""}
              type={DEAL_TYPES.find((d) => d.id === l.type)?.name || l.type}
              seller={l.user?.name || undefined}
              isPremium={l.isPremium}
              createdAt={l.createdAt.toISOString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
