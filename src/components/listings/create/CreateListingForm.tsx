"use client"

import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, MapPin, Plus, Sparkles } from "lucide-react"
import { createListingAction } from "@/app/(main)/listings/create/actions"
import { INITIAL_CREATE_LISTING_STATE, type CreateListingState } from "@/lib/listing-form"
import { DEAL_TYPES, PROPERTY_CATEGORIES, REGIONS, getDistricts } from "@/lib/locations"
import ListingImageUploader from "./ListingImageUploader"
import type { Coordinates } from "./MapPicker"

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100" />,
})

const inputCls =
  "h-12 w-full px-4 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-[#0A7C4E]"
const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block"
const errorCls = "mt-1 text-xs text-red-600 dark:text-red-400"
const draftKey = "olsot:create-listing:draft:v1"
const steps = ["Asosiy ma'lumot", "Manzil va yakunlash"]

type DraftValue = string | boolean

function slugify(value: string): string {
  return value
    .toLocaleLowerCase("uz-UZ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻʼ'`’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export default function CreateListingForm({ storageReady }: { storageReady: boolean }) {
  const [state, setState] = useState<CreateListingState>(INITIAL_CREATE_LISTING_STATE)
  const [isPending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("UZS")
  const [listingType, setListingType] = useState("SALE")
  const [category, setCategory] = useState("APARTMENT")
  const [region, setRegion] = useState("")
  const [district, setDistrict] = useState("")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [rooms, setRooms] = useState("")
  const [area, setArea] = useState("")
  const [renovation, setRenovation] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [hasGas, setHasGas] = useState(false)
  const [hasWater, setHasWater] = useState(false)
  const [hasElectricity, setHasElectricity] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [step, setStep] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [draftError, setDraftError] = useState("")
  const [clientError, setClientError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [aiError, setAiError] = useState("")
  const [isImprovingCopy, setIsImprovingCopy] = useState(false)
  const [isSmartFilling, setIsSmartFilling] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [draftId] = useState(() => crypto.randomUUID())
  const districts = getDistricts(region)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(draftKey) ?? "null")
        if (isRecord(stored)) {
          const fields = isRecord(stored.fields) ? stored.fields : {}
          for (const control of formRef.current?.querySelectorAll<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >("[name]") ?? []) {
            const value = fields[control.name]
            if (control instanceof HTMLInputElement && control.type === "checkbox") {
              control.checked = value === true
            } else if (typeof value === "string") {
              control.value = value
            }
          }
          setTitle(typeof fields.title === "string" ? fields.title : "")
          setPrice(typeof fields.price === "string" ? fields.price : "")
          setCurrency(typeof fields.currency === "string" ? fields.currency : "UZS")
          setListingType(typeof fields.type === "string" ? fields.type : "SALE")
          setCategory(typeof fields.category === "string" ? fields.category : "APARTMENT")
          setRegion(typeof fields.region === "string" ? fields.region : "")
          setDistrict(typeof fields.district === "string" ? fields.district : "")
          setAddress(typeof fields.address === "string" ? fields.address : "")
          setDescription(typeof fields.description === "string" ? fields.description : "")
          setRooms(typeof fields.rooms === "string" ? fields.rooms : "")
          setArea(typeof fields.area === "string" ? fields.area : "")
          setRenovation(typeof fields.renovation === "string" ? fields.renovation : "")
          setImages(Array.isArray(stored.images)
            ? stored.images.filter((item): item is string => typeof item === "string")
            : [])
          setHasGas(fields.hasGas === true)
          setHasWater(fields.hasWater === true)
          setHasElectricity(fields.hasElectricity === true)
          if (
            typeof fields.latitude === "string" &&
            typeof fields.longitude === "string" &&
            Number.isFinite(Number(fields.latitude)) &&
            Number.isFinite(Number(fields.longitude))
          ) {
            setCoordinates({ lat: Number(fields.latitude), lng: Number(fields.longitude) })
          }
        }
      } catch {
        setDraftError("Qoralamani tiklash imkoni bo'lmadi")
      }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const saveDraft = useCallback(() => {
    const form = formRef.current
    if (!form) return
    const fields: Record<string, DraftValue> = {}
    for (const control of form.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >("[name]")) {
      fields[control.name] =
        control instanceof HTMLInputElement && control.type === "checkbox"
          ? control.checked
          : control.value
    }
    try {
      localStorage.setItem(draftKey, JSON.stringify({ fields, images }))
      setDraftError("")
    } catch {
      setDraftError("Qoralamani saqlab bo'lmadi. Brauzer xotirasini tekshiring.")
    }
  }, [images])

  useEffect(() => {
    if (!hydrated) return
    const timer = window.setTimeout(saveDraft, 250)
    return () => window.clearTimeout(timer)
  }, [
    hydrated, title, price, currency, listingType, category, region, district, address, description, rooms, area, renovation, images, coordinates,
    hasGas, hasWater, hasElectricity, saveDraft,
  ])

  const slug = slugify([
    rooms ? `${rooms}-xonalik` : "",
    title,
    district,
    region,
  ].filter(Boolean).join(" "))
  const getFieldError = (name: string) =>
    fieldErrors[name] ?? state.fieldErrors?.[name]?.[0] ?? ""

  const validateStep = (targetStep: number): boolean => {
    const errors: Record<string, string> = {}
    if (targetStep === 0) {
      if (title.trim().length < 5) errors.title = "Sarlavha kamida 5 belgidan iborat bo'lsin"
      if (!Number.isFinite(Number(price)) || Number(price) <= 0) errors.price = "Narxni to'g'ri kiriting"
      if (description.trim().length < 20) errors.description = "Tavsif kamida 20 belgidan iborat bo'lsin"
      if (images.length === 0) errors.images = "Kamida 1 ta rasm yuklang"
    }
    if (targetStep === 1) {
      if (!region) errors.region = "Viloyatni tanlang"
      if (!district) errors.district = "Tuman yoki shaharni tanlang"
      if (address.trim().length < 5) errors.address = "Manzil kamida 5 belgidan iborat bo'lsin"
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setClientError("Belgilangan maydonlarni to'g'ri to'ldiring")
      return false
    }
    setClientError("")
    return true
  }

  const improveListingCopy = async () => {
    setAiError("")
    setIsImprovingCopy(true)
    try {
      const response = await fetch("/api/ai/improve-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
        }),
      })
      const result: unknown = await response.json()
      if (
        !response.ok ||
        !isRecord(result) ||
        typeof result.title !== "string" ||
        typeof result.description !== "string"
      ) {
        throw new Error(
          isRecord(result) && typeof result.error === "string"
            ? result.error
            : "E'lon matnini yaxshilab bo'lmadi",
        )
      }
      setTitle(result.title)
      setDescription(result.description)
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "E'lon matnini yaxshilab bo'lmadi")
    } finally {
      setIsImprovingCopy(false)
    }
  }

  const smartFill = async () => {
    if (!images[0]) return
    const form = formRef.current
    if (!form) return
    const formData = new FormData(form)
    setAiError("")
    setIsSmartFilling(true)
    try {
      const response = await fetch("/api/ai/smart-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          region,
          district,
          price: Number(price) || 0,
          currency: String(formData.get("currency") ?? "UZS"),
          category: String(formData.get("category") ?? "APARTMENT"),
          type: String(formData.get("type") ?? "SALE"),
          rooms: rooms ? Number(rooms) : undefined,
          area: area ? Number(area) : undefined,
          imageUrl: images[0],
        }),
      })
      const result: unknown = await response.json()
      if (
        !response.ok ||
        !isRecord(result) ||
        typeof result.title !== "string" ||
        typeof result.description !== "string"
      ) {
        throw new Error(
          isRecord(result) && typeof result.error === "string"
            ? result.error
            : "Rasmni tahlil qilib bo'lmadi",
        )
      }
      setTitle(result.title)
      setDescription(result.description)
      if (typeof result.rooms === "number") setRooms(String(result.rooms))
      setRenovation(typeof result.renovation === "string" ? result.renovation : "")
      setStep(0)
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Rasmni tahlil qilib bo'lmadi")
    } finally {
      setIsSmartFilling(false)
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (uploading) {
      setClientError("Rasmlar yuklanishi tugashini kuting")
      setStep(1)
      return
    }
    for (const targetStep of [0, 1]) {
      if (!validateStep(targetStep)) {
        setStep(targetStep)
        return
      }
    }

    setClientError("")
    setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      try {
        const result = await createListingAction(INITIAL_CREATE_LISTING_STATE, formData)
        if (result == null) {
          setClientError("E'lonni saqlashda javob olinmadi. Qayta urinib ko'ring.")
          return
        }
        setState(result)
      } catch (error) {
        const digest =
          typeof error === "object" && error !== null && "digest" in error
            ? String(error.digest)
            : ""
        if (digest.startsWith("NEXT_REDIRECT")) {
          localStorage.removeItem(draftKey)
          throw error
        }
        setClientError("E'lonni saqlashda xatolik yuz berdi. Qayta urinib ko'ring.")
      } finally {
        setSubmitting(false)
      }
    })
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={() => window.setTimeout(saveDraft, 0)}
      noValidate
      className="space-y-4"
    >
      {(state.error || clientError) && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{clientError || state.error}</span>
        </div>
      )}

      {!storageReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Supabase Storage sozlanmagan. Rasmlarni yuklash uchun env qiymatlarini tekshiring.
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-700 text-xs font-bold text-white">
              {step + 1}
            </span>
            <span className="text-sm font-semibold text-green-800">{steps[step]}</span>
          </div>
          <span className="text-xs font-medium text-gray-500">{step + 1}/2-qadam</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-green-700 transition-all" style={{ width: `${((step + 1) / 2) * 100}%` }} />
        </div>
        {slug && (
          <p className="mt-3 truncate text-[11px] text-gray-500" title={slug}>
            SEO URL namunasi: <span className="font-medium text-gray-700">{slug}</span>
          </p>
        )}
      </div>

      <section className={`${step === 0 ? "block" : "hidden"} rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900`}>
        <div className="space-y-3">
          <div>
            <label htmlFor="title" className={labelCls}>Sarlavha *</label>
            <input
              id="title"
              name="title"
              required
              minLength={5}
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Masalan: Chilonzorda 3 xonali kvartira"
              className={inputCls}
              aria-invalid={Boolean(getFieldError("title"))}
            />
            {getFieldError("title") && <p className={errorCls}>{getFieldError("title")}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="type" className={labelCls}>Bitim turi *</label>
              <select id="type" name="type" value={listingType} onChange={(event) => setListingType(event.target.value)} className={inputCls}>
                {DEAL_TYPES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category" className={labelCls}>Kategoriya *</label>
              <select id="category" name="category" value={category} onChange={(event) => setCategory(event.target.value)} className={inputCls}>
                {PROPERTY_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2.5">
            <div>
              <label htmlFor="price" className={labelCls}>Narx *</label>
              <input
                id="price"
                name="price"
                type="number"
                min={1}
                step="any"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="450000000"
                className={inputCls}
                aria-invalid={Boolean(getFieldError("price"))}
              />
              {getFieldError("price") && <p className={errorCls}>{getFieldError("price")}</p>}
            </div>
            <div>
              <label htmlFor="currency" className={labelCls}>Valyuta</label>
              <select id="currency" name="currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className={inputCls}>
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="rooms" className={labelCls}>Xonalar soni</label>
              <input id="rooms" name="rooms" type="number" min={0} max={20} step={1} value={rooms} onChange={(event) => setRooms(event.target.value)} className={inputCls} />
              {getFieldError("rooms") && <p className={errorCls}>{getFieldError("rooms")}</p>}
            </div>
            <div>
              <label htmlFor="area" className={labelCls}>Maydon (m²)</label>
              <input id="area" name="area" type="number" min={1} step="any" value={area} onChange={(event) => setArea(event.target.value)} className={inputCls} />
              {getFieldError("area") && <p className={errorCls}>{getFieldError("area")}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="renovation" className={labelCls}>Ta&apos;mir holati</label>
            <input
              id="renovation"
              name="renovation"
              type="text"
              maxLength={80}
              value={renovation}
              onChange={(event) => setRenovation(event.target.value)}
              placeholder="Masalan: Yevroremont, o'rtacha, ta'mirsiz"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <section className={`${step === 0 ? "block" : "hidden"} space-y-4`}>
        <ListingImageUploader
          images={images}
          onChange={setImages}
          onBusyChange={setUploading}
          onError={(message) => setFieldErrors((current) => ({ ...current, images: message }))}
          draftId={draftId}
          disabled={!storageReady}
        />
        {getFieldError("images") && <p className={errorCls}>{getFieldError("images")}</p>}
        {images.length > 0 && (
          <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4">
            <button
              type="button"
              onClick={smartFill}
              disabled={isSmartFilling || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {isSmartFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isSmartFilling ? "Rasm tahlil qilinmoqda..." : "AI orqali to'ldirish"}
            </button>
            <p className="mt-2 text-xs text-green-900">
              AI rasmga qarab sarlavha, tavsif va xonalar sonini taxmin qiladi. Natijani tekshirib chiqing.
            </p>
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="description" className={labelCls}>Tavsif *</label>
            <span className="text-xs text-gray-500">Keyingi qadamda e&apos;lonni ko&apos;rib chiqing va AI bilan tahrirlang</span>
          </div>
          <textarea
            id="description"
            name="description"
            required
            minLength={20}
            rows={5}
            maxLength={2000}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="E'lon haqida batafsil..."
            className={`${inputCls} h-auto resize-none py-3`}
            aria-invalid={Boolean(getFieldError("description"))}
          />
          {getFieldError("description") && <p className={errorCls}>{getFieldError("description")}</p>}
          {aiError && <p role="alert" className={errorCls}>{aiError}</p>}
        </div>
      </section>

      <section className={`${step === 1 ? "block" : "hidden"} space-y-4`}>
      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="region" className={labelCls}>Viloyat *</label>
              <select
                id="region"
                name="region"
                required
                value={region}
                onChange={(event) => { setRegion(event.target.value); setDistrict("") }}
                className={inputCls}
                aria-invalid={Boolean(getFieldError("region"))}
              >
                <option value="">Tanlang</option>
                {REGIONS.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
              </select>
              {getFieldError("region") && <p className={errorCls}>{getFieldError("region")}</p>}
            </div>
            <div>
              <label htmlFor="district" className={labelCls}>Tuman / shahar *</label>
              <select
                id="district"
                name="district"
                required
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                disabled={!region}
                className={inputCls}
                aria-invalid={Boolean(getFieldError("district"))}
              >
                <option value="">{region ? "Tanlang" : "Avval viloyat"}</option>
                {districts.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              {getFieldError("district") && <p className={errorCls}>{getFieldError("district")}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="address" className={labelCls}>Manzil *</label>
            <input
              id="address"
              name="address"
              required
              minLength={5}
              maxLength={200}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Ko'cha, uy raqami"
              className={inputCls}
              aria-invalid={Boolean(getFieldError("address"))}
            />
            {getFieldError("address") && <p className={errorCls}>{getFieldError("address")}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMapOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50"
            >
              <MapPin className="h-4 w-4" />
              {mapOpen ? "Xaritani yopish" : "Xaritada belgilash"}
            </button>
            {coordinates && (
              <button
                type="button"
                onClick={() => setCoordinates(null)}
                className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Joylashuvni o&apos;chirish
              </button>
            )}
          </div>
          {mapOpen && (
            <MapPicker
              value={coordinates}
              onChange={setCoordinates}
              center={coordinates ? [coordinates.lat, coordinates.lng] : undefined}
            />
          )}
          <input type="hidden" name="latitude" value={coordinates?.lat ?? ""} />
          <input type="hidden" name="longitude" value={coordinates?.lng ?? ""} />

          <fieldset>
            <legend className={labelCls}>Kommunal xizmatlar</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { name: "hasGas", label: "Gaz bor", checked: hasGas, setChecked: setHasGas },
                { name: "hasWater", label: "Suv bor", checked: hasWater, setChecked: setHasWater },
                { name: "hasElectricity", label: "Elektr bor", checked: hasElectricity, setChecked: setHasElectricity },
              ].map((item) => (
                <label key={item.name} className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={item.checked}
                    onChange={(event) => item.setChecked(event.target.checked)}
                    className="h-4 w-4 accent-green-700"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm dark:bg-zinc-900">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">E&apos;lonni ko&apos;rib chiqish</h2>
            <p className="text-xs text-gray-500">Saytda ko&apos;rinishidan oldingi taxminiy ko&apos;rinish</p>
          </div>
          <button
            type="button"
            onClick={improveListingCopy}
            disabled={isImprovingCopy || title.trim().length < 5 || description.trim().length < 20}
            className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImprovingCopy
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Sparkles className="h-4 w-4" />}
            {isImprovingCopy ? "AI tahrir qilmoqda..." : "AI bilan yaxshilash"}
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
          {images[0] ? (
            <div className="relative h-48 w-full bg-gray-100">
              <Image src={images[0]} alt={title || "E'lon rasmi"} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
            </div>
          ) : (
            <div className="flex h-36 items-center justify-center bg-gray-50 text-sm text-gray-400">
              E&apos;lon rasmi tanlanmagan
            </div>
          )}
          <div className="space-y-2 p-4">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {title || "E'lon sarlavhasi"}
            </p>
            <p className="text-lg font-extrabold text-green-700">
              {price && Number.isFinite(Number(price))
                ? currency === "USD"
                  ? `$${Number(price).toLocaleString("uz-UZ")}`
                  : `${Number(price).toLocaleString("uz-UZ")} so'm`
                : "Narx kiritilmagan"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {[region, district, address].filter(Boolean).join(", ") || "Manzil kiritilmagan"}
            </p>
            {(hasGas || hasWater || hasElectricity || renovation) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {hasGas && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">Gaz</span>}
                {hasWater && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">Suv</span>}
                {hasElectricity && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">Svet</span>}
                {renovation && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">Ta&apos;mir: {renovation}</span>}
              </div>
            )}
            {description && (
              <p className="line-clamp-3 pt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>
        </div>
        {aiError && <p role="alert" className={errorCls}>{aiError}</p>}
      </section>
      </section>

      {draftError && <p role="status" className="text-xs text-amber-700">{draftError}</p>}

      <div className="flex gap-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(0, current - 1))}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" /> Ortga
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={() => {
              if (validateStep(step)) setStep((current) => current + 1)
            }}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 font-bold text-white hover:bg-green-800"
          >
            Davom etish <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isPending || submitting || uploading || !storageReady}
            className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-700 to-green-800 text-base font-extrabold text-white shadow-lg shadow-green-400/30 disabled:opacity-50"
          >
            {isPending || submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            E&apos;lonni joylash
          </button>
        )}
      </div>
      <p className="text-center text-[11px] text-gray-400">
        Qoralama avtomatik saqlanadi. E&apos;lon moderatsiyadan so&apos;ng saytda ko&apos;rinadi.
      </p>
    </form>
  )
}
