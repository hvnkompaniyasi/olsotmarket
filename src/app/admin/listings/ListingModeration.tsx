"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Crown, Loader2, Trash2, X } from "lucide-react"

interface ModerationListing {
  id: string
  title: string
  region: string
  district: string
  price: number
  currency: string
  createdAt: string
  images: string[]
  isPremium: boolean
  user: { name: string | null; phone: string | null }
}

interface Props {
  listings: ModerationListing[]
}

type Action = "approve" | "reject" | "vip" | "delete"

const actionLabels: Record<Action, string> = {
  approve: "Tasdiqlash",
  reject: "Rad etish",
  vip: "VIP qilish",
  delete: "O'chirish",
}

export default function ListingModeration({ listings: initialListings }: Props) {
  const [listings, setListings] = useState(initialListings)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")

  async function performAction(id: string, action: Action) {
    if (action === "delete" && !window.confirm("E’lonni butunlay o‘chirishni tasdiqlaysizmi?")) return

    setBusy(`${id}:${action}`)
    setError("")
    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        ...(action !== "delete"
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action }),
            }
          : {}),
      })
      const result: { error?: string } = await response.json()
      if (!response.ok) throw new Error(result.error || "Amalni bajarib bo'lmadi")

      if (action === "vip") {
        setListings((current) => current.map((listing) => listing.id === id ? { ...listing, isPremium: true } : listing))
      } else {
        setListings((current) => current.filter((listing) => listing.id !== id))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Kutilmagan xatolik yuz berdi")
    } finally {
      setBusy("")
    }
  }

  if (listings.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-slate-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">Tasdiqlashni kutayotgan e’lonlar yo‘q.</div>
  }

  return (
    <section aria-label="Moderatsiya qilinadigan e'lonlar" className="space-y-4">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
      {listings.map((listing) => (
        <article key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            {listing.images[0] ? (
              <Image src={listing.images[0]} alt={listing.title || "E’lon rasmi"} width={160} height={112} sizes="(max-width: 640px) 100vw, 160px" className="h-28 w-full rounded-xl object-cover sm:w-40" />
            ) : (
              <div aria-label="Rasm mavjud emas" className="h-28 w-full rounded-xl bg-slate-100 dark:bg-zinc-800 sm:w-40" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{listing.title || "Sarlavhasiz e'lon"}</h2>
                {listing.isPremium && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800"><Crown className="h-3.5 w-3.5" /> VIP</span>}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{listing.region}, {listing.district}</p>
              <p className="mt-2 font-bold text-emerald-700 dark:text-emerald-400">{listing.price.toLocaleString("uz-UZ")} {listing.currency}</p>
              <p className="mt-1 text-xs text-slate-400">Muallif: {listing.user.name || listing.user.phone || "Noma'lum"} · {new Date(listing.createdAt).toLocaleDateString("uz-UZ")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton action="approve" busy={busy} id={listing.id} onClick={performAction} />
                <ActionButton action="reject" busy={busy} id={listing.id} onClick={performAction} />
                <ActionButton action="vip" busy={busy} id={listing.id} onClick={performAction} disabled={listing.isPremium} />
                <ActionButton action="delete" busy={busy} id={listing.id} onClick={performAction} />
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

function ActionButton({ action, busy, id, onClick, disabled = false }: {
  action: Action
  busy: string
  id: string
  onClick: (id: string, action: Action) => void
  disabled?: boolean
}) {
  const loading = busy === `${id}:${action}`
  const Icon = action === "approve" ? Check : action === "reject" ? X : action === "vip" ? Crown : Trash2
  const colors = action === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : action === "reject" || action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-amber-500 hover:bg-amber-600"
  return (
    <button
      type="button"
      disabled={busy !== "" || disabled}
      onClick={() => onClick(id, action)}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${colors}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
      {actionLabels[action]}
    </button>
  )
}
