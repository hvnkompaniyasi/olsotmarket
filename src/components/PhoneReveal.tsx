"use client"

import { useState } from "react"
import { Phone } from "lucide-react"

interface PhoneRevealProps {
  phone: string | null
  compact?: boolean
  sticky?: boolean
}

function formatPhone(phone: string): string {
  if (phone.startsWith("+")) return phone
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("998")) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`
  }
  return `+${digits}`
}

export default function PhoneReveal({ phone, compact = false, sticky = false }: PhoneRevealProps) {
  const [revealed, setRevealed] = useState(false)

  if (!phone) {
    if (sticky) {
      return (
        <span className="flex h-11 flex-[1.35] items-center justify-center rounded-xl bg-gray-200 px-3 text-xs font-semibold text-gray-500">
          Telefon yo&apos;q
        </span>
      )
    }
    if (compact) return null
    return (
      <p className="w-full h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-center">
        Telefon ko&apos;rsatilmagan
      </p>
    )
  }

  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`

  if (revealed) {
    return (
      <a
        href={telHref}
        aria-label="Qo'ng'iroq qilish"
        className={
          sticky
            ? "flex h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-[#0A7C4E] px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#086339]"
            : compact
            ? "h-11 px-4 sm:px-5 bg-[#0A7C4E] hover:bg-[#086339] rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-colors"
            : "w-full h-11 bg-[#0A7C4E] hover:bg-[#086339] rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(10,124,78,0.25)] transition-colors"
        }
      >
        <Phone className="h-4 w-4" />
        <span className={compact ? "hidden sm:inline" : undefined}>
          {sticky ? "Qo'ng'iroq qilish" : compact ? "Qo'ng'iroq" : formatPhone(phone)}
        </span>
      </a>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setRevealed(true)}
      aria-label="Raqamni ko'rsatish"
      className={
        sticky
          ? "flex h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-[#0A7C4E] px-3 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#086339]"
          : compact
          ? "h-11 px-4 sm:px-5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5 shadow-sm hover:border-[#0A7C4E] transition-colors"
          : "w-full h-11 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(10,124,78,0.25)] transition-colors"
      }
    >
      <Phone className={sticky ? "h-4 w-4" : compact ? "h-4 w-4 text-[#0A7C4E]" : "h-4 w-4"} />
      <span className={compact ? "hidden sm:inline" : undefined}>
        {sticky ? "Qo'ng'iroq qilish" : compact ? "Qo'ng'iroq" : "Raqamni ko'rsatish"}
      </span>
    </button>
  )
}
