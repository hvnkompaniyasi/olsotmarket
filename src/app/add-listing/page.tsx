"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useUploadThing } from "@/lib/uploadthing"
import {
  Loader2, UploadCloud, X, ChevronLeft, ChevronRight, Star,
  CheckCircle, Home,
} from "lucide-react"
import Navbar from "@/components/Navbar"
import MobileNav from "@/components/MobileNav"
import LocationPicker from "@/components/LocationPicker"
import { REGIONS } from "@/lib/locations"

const DRAFT_KEY = "senest-draft-listing"

const CATEGORIES = [
  { id: "APARTMENT", name: "Kvartira" },
  { id: "HOUSE", name: "Uy / Hovli" },
  { id: "OFFICE", name: "Ofis" },
  { id: "LAND", name: "Yer" },
  { id: "WAREHOUSE", name: "Ombor" },
]

const DEALS = [
  { id: "SALE", name: "Sotiladi" },
  { id: "RENT", name: "Ijaraga" },
  { id: "DAILY", name: "Kunlik ijara" },
]

interface Region {
  id: string
  name: string
  districts?: string[]
}

interface DraftState {
  title: string
  description: string
  price: string
  region: string
  district: string
  address: string
  rooms: string
  area: string
  floor: string
  totalFloors: string
  hasGas: boolean
  hasWater: boolean
  hasElectricity: boolean
  category: string
  type: string
  images: string[]
  lat: number | null
  lng: number | null
}

const emptyDraft: DraftState = {
  title: "",
  description: "",
  price: "",
  region: "",
  district: "",
  address: "",
  rooms: "",
  area: "",
  floor: "",
  totalFloors: "",
  hasGas: false,
  hasWater: false,
  hasElectricity: false,
  category: "APARTMENT",
  type: "SALE",
  images: [],
  lat: null,
  lng: null,
}

const inputCls =
  "h-12 w-full px-4 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-[#0A7C4E]"

const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block"

export default function AddListingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [form, setForm] = useState<DraftState>(emptyDraft)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("listingImage", {
    onClientUploadComplete: (res) => {
      const urls = (res || []).map((r: { url: string }) => r.url)
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 10) }))
    },
    onUploadError: (e: Error) => setError(e.message || "Rasm yuklashda xato"),
  })

  // Qoralamani yuklash
  useEffect(() => {
    if (status !== "authenticated") return
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DraftState>
        setForm({ ...emptyDraft, ...parsed })
      }
    } catch {
      // jim
    }
    setDraftLoaded(true)
  }, [status])

  // Qoralamani saqlash (debounce)
  useEffect(() => {
    if (!draftLoaded || done) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      } catch {
        // jim
      }
    }, 600)
    return () => clearTimeout(t)
  }, [form, draftLoaded, done])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/add-listing")
  }, [status, router])

  const set = <K extends keyof DraftState>(key: K, value: DraftState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const regions = REGIONS as Region[]
  const districts = regions.find((r) => r.name === form.region)?.districts || []

  const onFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (arr.length === 0) return
    if (form.images.length + arr.length > 10) {
      setError("Maksimum 10 ta rasm")
      return
    }
    setError("")
    void startUpload(arr)
  }

  const moveImage = (index: number, dir: -1 | 1) => {
    setForm((f) => {
      const imgs = [...f.images]
      const target = index + dir
      if (target < 0 || target >= imgs.length) return f
      ;[imgs[index], imgs[target]] = [imgs[target], imgs[index]]
      return { ...f, images: imgs }
    })
  }

  const removeImage = (index: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))
  }

  const submit = async () => {
    setError("")
    if (!form.title.trim()) return setError("Sarlavhani kiriting")
    if (!form.price || Number(form.price) <= 0) return setError("Narxni to'g'ri kiriting")
    if (!form.region) return setError("Hududni tanlang")
    if (form.images.length === 0) return setError("Kamida 1 ta rasm yuklang")

    setSaving(true)
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          type: form.type,
          category: form.category,
          price: Number(form.price),
          region: form.region,
          district: form.district || undefined,
          address: form.address || undefined,
          latitude: form.lat ?? undefined,
          longitude: form.lng ?? undefined,
          rooms: form.rooms ? Number(form.rooms) : undefined,
          area: form.area ? Number(form.area) : undefined,
          floor: form.floor ? Number(form.floor) : undefined,
          totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
          hasGas: form.hasGas,
          hasWater: form.hasWater,
          hasElectricity: form.hasElectricity,
          images: form.images,
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || "Xatolik")
        return
      }
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* jim */ }
      setDone(true)
      window.scrollTo({ top: 0 })
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FBF8] dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A7C4E]" />
      </div>
    )
  }
  if (!session) return null

  // ===== HOLAT OYNASI =====
  if (done) {
    return (
      <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 flex items-center justify-center px-4 pb-24">
        <div className="max-w-sm w-full bg-white dark:bg-zinc-900 rounded-2xl p-6 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1.5">
            E'lon qabul qilindi!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
            E'loningiz moderatsiyaga yuborildi. Odatda ~24 soat ichida tekshirilib, saytda ko'rinadi. Natija haqida bildirishnoma olasiz.
          </p>
          <button
            onClick={() => router.push("/my-listings")}
            className="h-12 w-full bg-gradient-to-r from-[#0A7C4E] to-[#08623D] text-white rounded-xl font-bold text-sm mb-2"
          >
            E'lonlarimni ko'rish
          </button>
          <button
            onClick={() => { setDone(false); setForm(emptyDraft) }}
            className="h-12 w-full bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold text-sm"
          >
            Yana e'lon qo'shish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-10">
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ===== BITIM TURI ===== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
            {DEALS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => set("type", d.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  form.type === d.id
                    ? "bg-gradient-to-r from-[#0A7C4E] to-[#08623D] text-white shadow-md"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* ===== KATEGORIYA CHIPS ===== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <label className={labelCls}>Kategoriya *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => set("category", c.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-colors ${
                  form.category === c.id
                    ? "bg-[#0A7C4E] border-[#0A7C4E] text-white shadow-md shadow-green-400/30"
                    : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* ===== ASOSIY MA'LUMOTLAR ===== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-3">
          <div>
            <label className={labelCls}>Sarlavha *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={100} placeholder="Masalan: 3 xonali kvartira sotiladi" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tavsif</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} maxLength={2000} placeholder="E'lon haqida batafsil..." className={`${inputCls} h-auto py-3 resize-none`} />
          </div>
          <div>
            <label className={labelCls}>Narx ($) *</label>
            <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="45000" className={inputCls} />
          </div>
        </div>

        {/* ===== RASM YUKLASH (drag&drop + progress) ===== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <label className={labelCls}>Rasmlar * (maks. 10)</label>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-[#0A7C4E] bg-green-50 dark:bg-green-500/10"
                : "border-gray-200 dark:border-zinc-700 hover:border-[#0A7C4E]/60"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = "" }}
            />
            {isUploading ? (
              <div className="w-full max-w-xs mx-auto">
                <Loader2 className="h-6 w-6 animate-spin text-[#0A7C4E] mx-auto mb-2" />
                <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0A7C4E] to-[#08623D] animate-pulse" style={{ width: "70%" }} />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">Yuklanmoqda...</p>
              </div>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Rasmlarni shu yerga tashlang</p>
                <p className="text-[11px] text-gray-400 mt-0.5">yoki bosib tanlang · JPG, PNG</p>
              </>
            )}
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {form.images.map((img, i) => (
                <div key={img + i} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700">
                  <div className="relative w-full h-20"><Image src={img} alt="" fill sizes="100px" className="object-cover" /></div>
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0A7C4E] text-white text-[9px] font-bold rounded flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-current" /> Asosiy
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 flex items-center justify-center gap-1 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1 text-white disabled:opacity-30" aria-label="Chapga">
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => removeImage(i)} className="p-1 text-red-400" aria-label="O'chirish">
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="p-1 text-white disabled:opacity-30" aria-label="O'ngga">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== JOYLASHUV + XARITA ===== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelCls}>Hudud *</label>
              <select value={form.region} onChange={(e) => { set("region", e.target.value); set("district", "") }} className={inputCls}>
                <option value="">Tanlang</option>
                {regions.map((r) => (<option key={r.id} value={r.name}>{r.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tuman / shahar</label>
              <select value={form.district} onChange={(e) => set("district", e.target.value)} className={inputCls} disabled={!form.region}>
                <option value="">{form.region ? "Tanlang" : "Avval hudud"}</option>
                {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Manzil</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Ko'cha, uy raqami" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Aniq joylashuv (xaritada belgilang)</label>
            <LocationPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))} />
          </div>
        </div>

        {/* ===== XUSUSIYATLAR ===== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className={labelCls}>Xonalar</label>
              <input type="number" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Maydon m²</label>
              <input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Qavat</label>
              <input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Jami qavat</label>
              <input type="number" value={form.totalFloors} onChange={(e) => set("totalFloors", e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {([
              { key: "hasGas" as const, label: "Gaz bor" },
              { key: "hasWater" as const, label: "Suv bor" },
              { key: "hasElectricity" as const, label: "Elektr bor" },
            ]).map((item) => (
              <label key={item.key} className="flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer">
                <input type="checkbox" checked={form[item.key]} onChange={(e) => set(item.key, e.target.checked)} className="w-4 h-4 accent-[#0A7C4E]" />
                <span className="text-sm text-gray-700 dark:text-gray-200">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ===== SUBMIT ===== */}
        <button
          onClick={submit}
          disabled={saving || isUploading}
          className="h-13 h-14 w-full bg-gradient-to-r from-[#0A7C4E] to-[#08623D] hover:from-[#0A7C4E] hover:to-[#08623D] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-400/30 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Home className="h-5 w-5" />}
          E'lonni joylash
        </button>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center -mt-2">
          Ma'lumotlar qoralama sifatida avtomatik saqlanadi
        </p>
      </div>

      <MobileNav />
    </div>
  )
}
