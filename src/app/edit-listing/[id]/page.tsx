"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import * as Sentry from "@sentry/nextjs"
import { useUploadThing } from "@/lib/uploadthing"
import { formatPrice } from "@/lib/format"
import {
  ArrowLeft, Loader2, Send, Info, UploadCloud, X, ChevronLeft, ChevronRight, Star,
  CheckCircle, Flame, Droplets, Zap, Wifi, Snowflake, ShieldCheck, Armchair, Building2, Car
} from "lucide-react"
import Navbar from "@/components/Navbar"
import MobileNav from "@/components/MobileNav"
import { REGIONS } from "@/lib/locations"

// Xaritani dinamik yuklash (SSR xatolarini oldini oladi)
const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-64 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-zinc-800" />
})

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

// BARCHA YANGI MAYDONLAR QO'SHILDI
interface FormState {
  title: string
  description: string
  price: string
  currency: string
  category: string
  type: string
  images: string[]
  region: string
  district: string
  address: string
  lat: number | null
  lng: number | null
  rooms: string
  area: string
  floor: string
  totalFloors: string
  hasGas: boolean
  hasWater: boolean
  hasElectricity: boolean
  hasSewage: boolean
  hasWifi: boolean
  hasAirConditioner: boolean
  hasSecurity: boolean
  parking: boolean
  elevator: boolean
  furniture: boolean
  renovation: string
}

const emptyForm: FormState = {
  title: "", description: "", price: "", currency: "UZS", category: "APARTMENT", type: "SALE",
  images: [], region: "", district: "", address: "", lat: null, lng: null, rooms: "", area: "",
  floor: "", totalFloors: "", hasGas: false, hasWater: false, hasElectricity: false, hasSewage: false,
  hasWifi: false, hasAirConditioner: false, hasSecurity: false, parking: false, elevator: false,
  furniture: false, renovation: "",
}

const inputCls = "h-12 w-full px-4 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-[#0A7C4E]"
const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block"

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const id = String(params.id || "")

  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("listingImage", {
    onClientUploadComplete: (res) => {
      const urls = (res || []).map((r: { url: string }) => r.url)
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 10) }))
    },
    onUploadError: (e: Error) => {
      setError(e.message || "Rasm yuklashda xato")
      Sentry.captureException(e)
    },
  })

  useEffect(() => {
    if (status === "unauthenticated") router.push(`/login?callbackUrl=/edit-listing/${id}`)
  }, [status, router, id])

  // Mavjud e'lonni yuklash
  useEffect(() => {
    if (!id || !session) return
    fetch(`/api/listings/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("E'lonni yuklab bo'lmadi")
        return r.json()
      })
      .then((d) => {
        const l = d.listing || d
        if (!l || !l.id) throw new Error("E'lon topilmadi")
        
        setForm({
          title: l.title || "",
          description: l.description || "",
          price: String(l.price || ""),
          currency: l.currency || "UZS",
          category: l.category || "APARTMENT",
          type: l.type || "SALE",
          images: l.images || [],
          region: l.region || "",
          district: l.district || "",
          address: l.address || "",
          lat: l.latitude ?? null,
          lng: l.longitude ?? null,
          rooms: l.rooms != null ? String(l.rooms) : "",
          area: l.area != null ? String(l.area) : "",
          floor: l.floor != null ? String(l.floor) : "",
          totalFloors: l.totalFloors != null ? String(l.totalFloors) : "",
          hasGas: !!l.hasGas,
          hasWater: !!l.hasWater,
          hasElectricity: !!l.hasElectricity,
          hasSewage: !!l.hasSewage,
          hasWifi: !!l.hasWifi,
          hasAirConditioner: !!l.hasAirConditioner,
          hasSecurity: !!l.hasSecurity,
          parking: !!l.parking,
          elevator: !!l.elevator,
          furniture: !!l.furniture,
          renovation: l.renovation || "",
        })
      })
      .catch((err) => {
        setError(err.message || "E'lonni yuklab bo'lmadi")
        Sentry.captureException(err)
      })
      .finally(() => setLoading(false))
  }, [id, session])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const regions = REGIONS as Region[]
  const districts = regions.find((r) => r.name === form.region)?.districts || []

  const onFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (arr.length === 0) return
    if (form.images.length + arr.length > 10) {
      setError("Maksimum 10 ta rasm yuklash mumkin")
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
    if (form.images.length === 0) return setError("Kamida 1 ta rasm qoldiring")

    setSaving(true)
    try {
      const res = await fetch(`/api/listings/${id}/edit-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          currency: form.currency,
          category: form.category,
          type: form.type,
          images: form.images,
          region: form.region,
          district: form.district || undefined,
          address: form.address || undefined,
          latitude: form.lat,
          longitude: form.lng,
          rooms: form.rooms === "" ? null : Number(form.rooms),
          area: form.area === "" ? null : Number(form.area),
          floor: form.floor === "" ? null : Number(form.floor),
          totalFloors: form.totalFloors === "" ? null : Number(form.totalFloors),
          hasGas: form.hasGas,
          hasWater: form.hasWater,
          hasElectricity: form.hasElectricity,
          hasSewage: form.hasSewage,
          hasWifi: form.hasWifi,
          hasAirConditioner: form.hasAirConditioner,
          hasSecurity: form.hasSecurity,
          parking: form.parking,
          elevator: form.elevator,
          furniture: form.furniture,
          renovation: form.renovation || undefined,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Xatolik yuz berdi")
      
      setDone(true)
      window.scrollTo({ top: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi")
      Sentry.captureException(err)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FBF8] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0A7C4E]" />
          <p className="text-sm text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }
  if (!session) return null

  // ===== HOLAT OYNASI =====
  if (done) {
    return (
      <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 flex items-center justify-center px-4 pb-24">
        <div className="max-w-sm w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 text-center shadow-xl border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
            O&apos;zgarishlar yuborildi!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
            O&apos;zgarishlaringiz moderator tekshiruviga yuborildi. Tasdiqlangach e&apos;lon yangilanadi va sizga bildirishnoma keladi.
          </p>
          <button
            onClick={() => router.push("/my-listings")}
            className="h-12 w-full bg-[#0A7C4E] hover:bg-[#086339] text-white rounded-xl font-bold text-sm transition-colors"
          >
            E&apos;lonlarimni ko&apos;rish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-10">
      <Navbar />

      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        <Link href="/my-listings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#0A7C4E] transition-colors">
          <ArrowLeft className="h-4 w-4" /> E&apos;lonlarim
        </Link>

        <div className="p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl flex gap-2.5">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
            O&apos;zgarishlar moderator tekshiruvidan so&apos;ng qo&apos;llaniladi. Ko&apos;rik paytida e&apos;lonning hozirgi holati saytda qoladi.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* BITIM TURI */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
          <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-xl p-1">
            {DEALS.map((d) => (
              <button
                key={d.id} type="button" onClick={() => set("type", d.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  form.type === d.id ? "bg-[#0A7C4E] text-white shadow-md" : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        {/* KATEGORIYA */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
          <label className={labelCls}>Kategoriya *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id} type="button" onClick={() => set("category", c.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-colors ${
                  form.category === c.id
                    ? "bg-[#0A7C4E] border-[#0A7C4E] text-white shadow-md shadow-green-400/30"
                    : "bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-[#0A7C4E]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* ASOSIY */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
          <div>
            <label className={labelCls}>Sarlavha *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={120} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Tavsif</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} maxLength={2000} className={`${inputCls} h-auto py-3 resize-y`} />
          </div>
          <div>
            <label className={labelCls}>Narx *</label>
            <div className="flex gap-2">
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} className={`${inputCls} flex-1`} />
              <div className="flex shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                {(["USD", "UZS"] as const).map((curr) => (
                  <button
                    key={curr} type="button" onClick={() => set("currency", curr)}
                    className={`min-w-14 rounded-lg px-2 text-xs font-bold transition ${form.currency === curr ? "bg-[#0A7C4E] text-white shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
            {form.price && Number(form.price) > 0 && (
              <p className="mt-1.5 text-xs text-gray-500">{formatPrice(Number(form.price), form.currency)}</p>
            )}
          </div>
        </div>

        {/* RASMLAR */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800">
          <label className={labelCls}>Rasmlar * (maks. 10)</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              dragOver ? "border-[#0A7C4E] bg-green-50 dark:bg-green-500/10" : "border-gray-200 dark:border-zinc-700 hover:border-[#0A7C4E]/60"
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = "" }} />
            {isUploading ? (
              <div className="w-full max-w-xs mx-auto">
                <Loader2 className="h-6 w-6 animate-spin text-[#0A7C4E] mx-auto mb-2" />
                <p className="text-[11px] text-gray-400 mt-1.5">Yuklanmoqda...</p>
              </div>
            ) : (
              <>
                <UploadCloud className="h-7 w-7 text-gray-300 dark:text-zinc-600 mx-auto mb-1.5" />
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Rasm qo&apos;shish</p>
              </>
            )}
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {form.images.map((img, i) => (
                <div key={img + i} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100">
                  <div className="relative w-full h-24"><Image src={img} alt="" fill sizes="100px" className="object-cover" /></div>
                  {i === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0A7C4E] text-white text-[9px] font-bold rounded flex items-center gap-0.5">
                      <Star className="h-2.5 w-2.5 fill-current" /> Asosiy
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 flex items-center justify-center gap-1 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1 text-white disabled:opacity-30" aria-label="Chapga">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => removeImage(i)} className="p-1 text-red-400" aria-label="O'chirish">
                      <X className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="p-1 text-white disabled:opacity-30" aria-label="O'ngga">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MANZIL VA XARITA */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Viloyat *</label>
              <select value={form.region} onChange={(e) => { set("region", e.target.value); set("district", "") }} className={inputCls}>
                <option value="">Tanlang</option>
                {regions.map((r) => (<option key={r.id} value={r.name}>{r.name}</option>))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Tuman / shahar</label>
              <select value={form.district} onChange={(e) => set("district", e.target.value)} className={inputCls} disabled={!form.region}>
                <option value="">{form.region ? "Tanlang" : "Avval viloyat"}</option>
                {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Manzil</label>
            <input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} placeholder="Ko'cha, uy raqami" />
          </div>
          <div>
            <label className={labelCls}>Xaritada aniq joylashuv</label>
            <LocationPicker lat={form.lat} lng={form.lng} onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))} />
          </div>
        </div>

        {/* XUSUSIYATLAR VA QULAYLIKLAR */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div><label className={labelCls}>Xonalar</label><input type="number" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Maydon (m²)</label><input type="number" value={form.area} onChange={(e) => set("area", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Qavat</label><input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Bino qavati</label><input type="number" value={form.totalFloors} onChange={(e) => set("totalFloors", e.target.value)} className={inputCls} /></div>
          </div>
          <div>
            <label className={labelCls}>Ta&apos;mir holati</label>
            <input value={form.renovation} onChange={(e) => set("renovation", e.target.value)} className={inputCls} placeholder="Masalan: Yevroremont" />
          </div>

          <fieldset className="pt-2">
            <legend className="text-sm font-bold text-gray-900 dark:text-white mb-2">Kommunal xizmatlar</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: "hasGas" as const, label: "Gaz", icon: Flame },
                { key: "hasWater" as const, label: "Suv", icon: Droplets },
                { key: "hasElectricity" as const, label: "Svet", icon: Zap },
                { key: "hasSewage" as const, label: "Kanalizatsiya", icon: Droplets },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer border border-gray-100 dark:border-zinc-700">
                  <input type="checkbox" checked={form[item.key]} onChange={(e) => set(item.key, e.target.checked)} className="w-4 h-4 accent-[#0A7C4E]" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"><item.icon className="h-3 w-3" />{item.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-bold text-gray-900 dark:text-white mb-2">Qulayliklar</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: "furniture" as const, label: "Mebel", icon: Armchair },
                { key: "elevator" as const, label: "Lift", icon: Building2 },
                { key: "parking" as const, label: "Avtoturargoh", icon: Car },
                { key: "hasWifi" as const, label: "Wi-Fi", icon: Wifi },
                { key: "hasAirConditioner" as const, label: "Konditsioner", icon: Snowflake },
                { key: "hasSecurity" as const, label: "Xavfsizlik", icon: ShieldCheck },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-zinc-800 rounded-xl cursor-pointer border border-gray-100 dark:border-zinc-700">
                  <input type="checkbox" checked={form[item.key]} onChange={(e) => set(item.key, e.target.checked)} className="w-4 h-4 accent-[#0A7C4E]" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-1"><item.icon className="h-3 w-3" />{item.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <button
          onClick={submit} disabled={saving || isUploading}
          className="h-14 w-full bg-[#0A7C4E] hover:bg-[#086339] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-400/30 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          O&apos;zgarishlarni yuborish
        </button>
      </div>

      <MobileNav />
    </div>
  )
}