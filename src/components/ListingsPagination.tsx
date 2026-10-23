import Link from "next/link";

interface ListingsPaginationProps {
  total: number;
  page: number;
  perPage: number;
  params: string;
}

export default function ListingsPagination({ total, page, perPage, params }: ListingsPaginationProps) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  const base = params ? `/listings?${params}&page=` : "/listings?page=";
  const cls = "flex h-9 items-center rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700 transition-all duration-200 hover:border-[#0A7C4E] hover:text-[#0A7C4E] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200";
  return (
    <nav className="flex items-center justify-center gap-2 py-6" aria-label="E'lonlar sahifalari">
      {page > 1 && <Link href={`${base}${page - 1}`} className={cls}>← Oldingi</Link>}
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 px-2">
        {page} / {pages}
      </span>
      {page < pages && <Link href={`${base}${page + 1}`} className={cls}>Keyingi →</Link>}
    </nav>
  );
}
