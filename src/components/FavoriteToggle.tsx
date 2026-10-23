"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Heart, Loader2 } from "lucide-react"

interface Props {
  listingId: string
  initial: boolean
}

export default function FavoriteToggle({ listingId, initial }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [fav, setFav] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const toggle = async () => {
    if (busy) return
    if (!session) {
      router.push(`/login?callbackUrl=/listing/${listingId}`)
      return
    }
    const prev = fav
    setFav(!prev)
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      })
      if (!res.ok) {
        setFav(prev)
        setError("Sevimlilar ro'yxatini yangilab bo'lmadi.")
      }
    } catch {
      setFav(prev)
      setError("Aloqa xatosi. Qayta urinib ko'ring.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={fav ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
      aria-pressed={fav}
      aria-busy={busy}
      title={fav ? "Sevimlilardan olib tashlash" : "Sevimlilarga qo'shish"}
      className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700 active:scale-90 disabled:cursor-wait ${
        fav ? "bg-white text-red-500 shadow-lg" : "bg-black/40 text-white hover:bg-black/60"
      }`}
    >
      {busy ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart className={`h-5 w-5 transition-transform duration-200 ${fav ? "scale-110 fill-current" : "scale-100"}`} />
      )}
      <span className="sr-only" aria-live="polite">{error}</span>
    </button>
  )
}
