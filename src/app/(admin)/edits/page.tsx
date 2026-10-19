"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle, XCircle, Loader2, FileEdit, ArrowRight } from "lucide-react"

interface EditUser {
  name: string | null
  phone: string | null
}

interface EditItem {
  id: string
  createdAt: string
  changes: unknown
  listingId: string
  user: EditUser | null
  listing: Record<string, unknown> | null
}

const FIELD_LABELS: Record<string, string> = {
  title: "Sarlavha",
  description: "Tavsif",
  price: "Narx",
  category: "Kategoriya",
  type: "Bitim turi",
  images: "Rasmlar",
  region: "Hudud",
  district: "Tuman",
  address: "Manzil",
  latitude: "Kenglik",
  longitude: "Uzunlik",
  rooms: "Xonalar",
  area: "Maydon",
  floor: "Qavat",
  totalFloors: "Jami qavat",
  hasGas: "Gaz",
  hasWater: "Suv",
  hasElectricity: "Elektr",
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—"
  if (typeof v === "boolean") return v ? "Ha" : "Yo'q"
  if (Array.isArray(v)) return `${v.length} ta rasm`
  if (typeof v === "number") return v.toLocaleString("en-US")
  const s = String(v)
  return s.length > 100 ? s.slice(0, 100) + "…" : s
}

export default function AdminEditsPage() {
  const [edits, setEdits] = useState<EditItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState("")

  const load = useCallback(() => {
    setLoading(true)
    fetch("/api/admin/edits")
      .then((r) => r.json())
      .then((d) => setEdits(d.edits || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id + action)
    try {
      await fetch(`/api/admin/edits/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      load()
    } finally {
      setBusy("")
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-1">O'zgarish so'rovlari</h1>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
        Foydalanuvchilar yuborgan e'lon o'zgarishlari — tasdiqlang yoki rad et
      </p>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-7 w-7 animate-spin text-green-500" />
        </div>
      ) : edits.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800">
          <FileEdit className="h-10 w-10 text-gray-300 dark:text-zinc-700 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Kutilayotgan so'rovlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-4">
          {edits.map((edit) => {
            const changes = (edit.changes || {}) as Record<string, unknown>
            const listing = edit.listing || {}
            return (
              <div key={edit.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  {Array.isArray(listing.images) && typeof listing.images[0] === "string" ? (
                    <img src={listing.images[0]} alt={String(listing.title || "E'lon") || "E'lon rasmi"} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-zinc-800 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                      {String(listing.title || "E'lon")}
                    </div>
                    <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {edit.user?.name || edit.user?.phone || "Noma'lum"} · {new Date(edit.createdAt).toLocaleString("uz-UZ")}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  {Object.entries(changes).map(([key, newVal]) => (
                    <div key={key} className="flex items-start gap-2 text-xs bg-gray-50 dark:bg-zinc-800/60 rounded-lg px-3 py-2">
                      <span className="font-semibold text-gray-600 dark:text-gray-300 w-24 flex-shrink-0">
                        {FIELD_LABELS[key] || key}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 line-through truncate max-w-[30%]">
                        {fmt(listing[key])}
                      </span>
                      <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-900 dark:text-white font-semibold break-words">
                        {fmt(newVal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => act(edit.id, "approve")}
                    disabled={busy !== ""}
                    className="flex-1 h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {busy === edit.id + "approve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => act(edit.id, "reject")}
                    disabled={busy !== ""}
                    className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {busy === edit.id + "reject" ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Rad etish
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
