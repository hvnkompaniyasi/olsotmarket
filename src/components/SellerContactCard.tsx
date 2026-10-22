import { CalendarDays, ShieldCheck, UserRound } from "lucide-react"
import PhoneReveal from "@/components/PhoneReveal"

interface SellerContactCardProps {
  sellerName: string | null
  phone: string | null
  createdAt: string
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}.${month}.${date.getFullYear()}`
}

export default function SellerContactCard({ sellerName, phone, createdAt }: SellerContactCardProps) {
  return (
    <section className="glass rounded-2xl p-4 sm:p-5" aria-labelledby="seller-title">
      <h2
        id="seller-title"
        className="text-sm font-extrabold text-gray-900 dark:text-white mb-3"
      >
        Sotuvchi
      </h2>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <UserRound className="h-5 w-5 text-[#0A7C4E]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
            {sellerName || "Anonim"}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">E&apos;lon egasi</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <CalendarDays className="h-4 w-4 text-[#0A7C4E] flex-shrink-0" />
        <span>
          E&apos;lon joylangan:{" "}
          <span className="font-bold text-gray-900 dark:text-white">{formatDate(createdAt)}</span>
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200/60 dark:border-zinc-700/60">
        <PhoneReveal phone={phone} />
        <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-gray-400 dark:text-gray-500">
          <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 mt-px" />
          Telefon raqami faqat &quot;Raqamni ko&apos;rsatish&quot; bosilganda ochiladi.
        </p>
      </div>
    </section>
  )
}
