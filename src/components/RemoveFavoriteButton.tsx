"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart, Loader2 } from "lucide-react"

export default function RemoveFavoriteButton({ listingId }: { listingId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const remove = async () => {
    if (busy) return
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
      if (!response.ok) {
        setError("Sevimlilardan olib tashlab bo'lmadi.")
        return
      }
      router.refresh()
    } catch {
      setError("Aloqa xatosi. Qayta urinib ko'ring.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={remove}
      disabled={busy}
      aria-label="Sevimlilardan o'chirish"
      aria-busy={busy}
      className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-wait dark:bg-zinc-900/95"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4 fill-current" />}
      <span className="sr-only" aria-live="polite">{error}</span>
    </button>
  )
}
