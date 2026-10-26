"use client"

import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import {
  AlertCircle,
  Armchair,
  Building2,
  Car,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Zap,
} from "lucide-react"
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
  const [livingArea, setLivingArea] = useState("")
  const [landArea, setLandArea] = useState("")
  const [purpose, setPurpose] = useState("")
  const [buildingType, setBuildingType] = useState("")
  const [electricityPower, setElectricityPower] = useState("")
  const [entrance, setEntrance] = useState("")
  const [bathroom, setBathroom] = useState("")
  const [deposit, setDeposit] = useState("")
  const [utilitiesCondition, setUtilitiesCondition] = useState("")
  const [floor, setFloor] = useState("")
  const [totalFloors, setTotalFloors] = useState("")
  const [renovation, setRenovation] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [hasGas, setHasGas] = useState(false)
  const [hasWater, setHasWater] = useState(false)
  const [hasElectricity, setHasElectricity] = useState(false)
  const [hasSewage, setHasSewage] = useState(false)
  const [parking, setParking] = useState(false)
  const [elevator, setElevator] = useState(false)
  const [furniture, setFurniture] = useState(false)
  const [usdRate, setUsdRate] = useState<number | null>(null)
  const [exchangeRateError, setExchangeRateError] = useState("")
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
  const isApartment = category === "APARTMENT" || listingType === "NEW_BUILDING"
  const isHouse = category === "HOUSE"
  const isLand = category === "LAND"
  const isOffice = category === "OFFICE"
  const isRental = listingType === "RENT" || listingType === "DAILY"

  useEffect(() => {
    const controller = new AbortController()
    void fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/", {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`CBU API status ${response.status}`)
        const result: unknown = await response.json()
        if (!Array.isArray(result)) throw new Error("CBU API returned invalid data")
        const usd = result.find(
          (item): item is Record<string, unknown> =>
            typeof item === "object" &&
            item !== null &&
            "Ccy" in item &&
            item.Ccy === "USD",
        )
        if (!usd || typeof usd.Rate !== "string") {
          throw new Error("USD rate was not found in CBU response")
        }
        const rate = Number(usd.Rate.replace(/\s/g, "").replace(",", "."))
        if (!Number.isFinite(rate) || rate <= 0) throw new Error("CBU returned invalid USD rate")
        setUsdRate(rate)
        setExchangeRateError("")
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setExchangeRateError("Markaziy bank kursini yuklab bo'lmadi")
      })
    return () => controller.abort()
  }, [])

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
          setLivingArea(typeof fields.livingArea === "string" ? fields.livingArea : "")
          setLandArea(typeof fields.landArea === "string" ? fields.landArea : "")
          setPurpose(typeof fields.purpose === "string" ? fields.purpose : "")
          setBuildingType(typeof fields.buildingType === "string" ? fields.buildingType : "")
          setElectricityPower(typeof fields.electricityPower === "string" ? fields.electricityPower : "")
          setEntrance(typeof fields.entrance === "string" ? fields.entrance : "")
          setBathroom(typeof fields.bathroom === "string" ? fields.bathroom : "")
          setDeposit(typeof fields.deposit === "string" ? fields.deposit : "")
          setUtilitiesCondition(typeof fields.utilitiesCondition === "string" ? fields.utilitiesCondition : "")
          setFloor(typeof fields.floor === "string" ? fields.floor : "")
          setTotalFloors(typeof fields.totalFloors === "string" ? fields.totalFloors : "")
          setRenovation(typeof fields.renovation === "string" ? fields.renovation : "")
          setImages(Array.isArray(stored.images)
            ? stored.images.filter((item): item is string => typeof item === "string")
            : [])
          setHasGas(fields.hasGas === true)
          setHasWater(fields.hasWater === true)
          setHasElectricity(fields.hasElectricity === true)
          setHasSewage(fields.hasSewage === true)
          setParking(fields.parking === true)
          setElevator(fields.elevator === true)
          setFurniture(fields.furniture === true)
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
    hydrated, title, price, currency, listingType, category, region, district, address, description,
    rooms, area, livingArea, landArea, purpose, buildingType, electricityPower, entrance, bathroom,
    deposit, utilitiesCondition, floor, totalFloors, renovation, images, coordinates, hasGas,
    hasWater, hasElectricity, hasSewage, parking, elevator, furniture, saveDraft,
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
      className="space-y-4 pb-24 lg:pb-0"
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

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Bosqich {step + 1} / 2
            </p>
            <h2 className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
              {steps[step]}
            </h2>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-800 dark:bg-green-500/10 dark:text-green-300">
            {step + 1}/2
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800"
          role="progressbar"
          aria-label="E'lon yaratish bosqichi"
          aria-valuemin={1}
          aria-valuemax={2}
          aria-valuenow={step + 1}
        >
          <div
            className="h-full rounded-full bg-green-700 transition-all"
            style={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>
        {slug && (
          <p className="mt-3 truncate text-[11px] text-gray-500" title={slug}>
            SEO URL namunasi: <span className="font-medium text-gray-700">{slug}</span>
          </p>
        )}
      </div>

      <section className={`${step === 0 ? "block" : "hidden"} space-y-4`}>
        <div>
          <ListingImageUploader
            images={images}
            onChange={setImages}
            onBusyChange={setUploading}
            onError={(message) => setFieldErrors((current) => ({ ...current, images: message }))}
            draftId={draftId}
            disabled={!storageReady}
          />
          {getFieldError("images") && <p className={errorCls}>{getFieldError("images")}</p>}
        </div>

        {images.length > 0 && (
          <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4 dark:border-green-900 dark:bg-green-950/30">
            <button
              type="button"
              onClick={smartFill}
              disabled={isSmartFilling || uploading}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {isSmartFilling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isSmartFilling ? "Rasm tahlil qilinmoqda..." : "AI orqali to'ldirish"}
            </button>
            <p className="mt-2 text-xs text-green-900 dark:text-green-200">
              AI rasmga qarab sarlavha, tavsif va xonalar sonini taxmin qiladi. Natijani tekshirib chiqing.
            </p>
          </div>
        )}

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label htmlFor="title" className={labelCls}>E&apos;lon sarlavhasi *</label>
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
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label htmlFor="description" className={labelCls}>Tavsif *</label>
              <span className="text-xs text-gray-400">{description.length}/2000</span>
            </div>
            <textarea
              id="description"
              name="description"
              required
              minLength={20}
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Uy yoki xonadon haqida batafsil yozing..."
              className={`${inputCls} h-auto resize-y py-3`}
              aria-invalid={Boolean(getFieldError("description"))}
            />
            {getFieldError("description") && <p className={errorCls}>{getFieldError("description")}</p>}
            {aiError && <p role="alert" className={errorCls}>{aiError}</p>}
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label htmlFor="price" className={labelCls}>Narx *</label>
            <div className="flex gap-2">
              <input
                id="price"
                name="price"
                type="number"
                min={1}
                step="any"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="Narxni kiriting"
                className={`${inputCls} min-w-0 flex-1`}
                aria-invalid={Boolean(getFieldError("price"))}
              />
              <div className="flex shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
                {(["UZS", "USD"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={currency === item}
                    onClick={() => setCurrency(item)}
                    className={`min-w-14 rounded-lg px-2 text-xs font-bold transition ${
                      currency === item
                        ? "bg-green-700 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <input type="hidden" name="currency" value={currency} />
            </div>
            {getFieldError("price") && <p className={errorCls}>{getFieldError("price")}</p>}
            {price && Number.isFinite(Number(price)) && Number(price) > 0 && usdRate && (
              <p className="mt-2 text-xs text-gray-500">
                Markaziy bank kursi ({usdRate.toLocaleString("uz-UZ")} so&apos;m/USD):{" "}
                {currency === "USD"
                  ? `$${Number(price).toLocaleString("en-US")} ≈ ${(Number(price) * usdRate).toLocaleString("uz-UZ")} so&apos;m`
                  : `${Number(price).toLocaleString("uz-UZ")} so&apos;m ≈ $${(Number(price) / usdRate).toLocaleString("en-US", { maximumFractionDigits: 2 })}`}
              </p>
            )}
            {exchangeRateError && <p className="mt-2 text-xs text-amber-700">{exchangeRateError}</p>}
          </div>

          {(isApartment || isHouse) && (
            <>
              <div>
                <p className={labelCls}>Xonalar soni</p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      aria-pressed={rooms === String(count)}
                      onClick={() => setRooms(String(count))}
                      className={`h-11 rounded-xl border text-sm font-semibold transition ${
                        rooms === String(count)
                          ? "border-green-700 bg-green-700 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-green-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-200"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={1}
                  value={rooms}
                  onChange={(event) => setRooms(event.target.value)}
                  aria-label="Xonalar sonini kiriting"
                  placeholder="Boshqa son"
                  className={`${inputCls} mt-2 h-10`}
                />
                <label htmlFor="rooms" className="sr-only">Xonalar soni</label>
                <input type="hidden" name="rooms" value={rooms} />
                {getFieldError("rooms") && <p className={errorCls}>{getFieldError("rooms")}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {isApartment && (
                  <div>
                    <label htmlFor="floor" className={labelCls}>Qavat</label>
                    <input id="floor" name="floor" type="number" min={0} max={200} step={1} value={floor} onChange={(event) => setFloor(event.target.value)} className={inputCls} placeholder="Masalan, 3" />
                  </div>
                )}
                <div>
                  <label htmlFor="totalFloors" className={labelCls}>Qavatlilik</label>
                  <input id="totalFloors" name="totalFloors" type="number" min={1} max={200} step={1} value={totalFloors} onChange={(event) => setTotalFloors(event.target.value)} className={inputCls} placeholder="Masalan, 9" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <fieldset>
            <legend className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Kommunal xizmatlar</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { name: "hasGas", label: "Gaz", checked: hasGas, setChecked: setHasGas, Icon: Flame },
                { name: "hasWater", label: "Suv", checked: hasWater, setChecked: setHasWater, Icon: Droplets },
                { name: "hasElectricity", label: "Svet", checked: hasElectricity, setChecked: setHasElectricity, Icon: Zap },
                { name: "hasSewage", label: "Kanalizatsiya", checked: hasSewage, setChecked: setHasSewage, Icon: Droplets },
              ].map(({ name, label, checked, setChecked, Icon }) => (
                <label key={name} className="group cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 transition peer-checked:border-green-700 peer-checked:bg-green-50 peer-checked:text-green-800 group-hover:border-green-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-gray-300 dark:peer-checked:bg-green-950/40">
                    <Icon className="h-5 w-5" />
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-bold text-gray-900 dark:text-white">Qulayliklar</legend>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "furniture", label: "Mebel", checked: furniture, setChecked: setFurniture, Icon: Armchair },
                { name: "elevator", label: "Lift", checked: elevator, setChecked: setElevator, Icon: Building2 },
                { name: "parking", label: "Avtoturargoh", checked: parking, setChecked: setParking, Icon: Car },
              ].map(({ name, label, checked, setChecked, Icon }) => (
                <label key={name} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={(event) => setChecked(event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-14 items-center justify-center gap-1 rounded-xl border border-gray-200 px-2 text-center text-xs font-semibold text-gray-600 transition peer-checked:border-green-700 peer-checked:bg-green-50 peer-checked:text-green-800 hover:border-green-400 dark:border-zinc-700 dark:text-gray-300 dark:peer-checked:bg-green-950/40">
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <details className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <summary className="cursor-pointer text-sm font-semibold text-gray-800 dark:text-white">
            Maydon va qo&apos;shimcha ma&apos;lumotlar
          </summary>
          <div className="mt-4 space-y-3">
            {(isApartment || isHouse || isOffice || category === "WAREHOUSE") && (
              <div>
                <label htmlFor="area" className={labelCls}>{isHouse ? "Uy maydoni (m²)" : "Umumiy maydon (m²)"}</label>
                <input id="area" name="area" type="number" min={1} step="any" value={area} onChange={(event) => setArea(event.target.value)} className={inputCls} />
                {getFieldError("area") && <p className={errorCls}>{getFieldError("area")}</p>}
              </div>
            )}
            {isApartment && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="livingArea" className={labelCls}>Yashash maydoni (m²)</label>
                    <input id="livingArea" name="livingArea" type="number" min={1} step="any" value={livingArea} onChange={(event) => setLivingArea(event.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="bathroom" className={labelCls}>Sanuzel soni</label>
                    <input id="bathroom" name="bathroom" type="number" min={0} max={100} step={1} value={bathroom} onChange={(event) => setBathroom(event.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label htmlFor="renovation" className={labelCls}>Ta&apos;mir holati</label>
                  <input id="renovation" name="renovation" maxLength={80} value={renovation} onChange={(event) => setRenovation(event.target.value)} placeholder="Masalan: Yevroremont, o'rtacha, ta'mirsiz" className={inputCls} />
                </div>
              </>
            )}
            {isLand && (
              <>
                <div>
                  <label htmlFor="landArea" className={labelCls}>Yer maydoni (sotix)</label>
                  <input id="landArea" name="landArea" type="number" min={0.01} step="any" value={landArea} onChange={(event) => setLandArea(event.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="purpose" className={labelCls}>Yer maqsadi</label>
                  <input id="purpose" name="purpose" maxLength={100} value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Masalan: uy-joy qurilishi" className={inputCls} />
                </div>
              </>
            )}
            {isHouse && (
              <div>
                <label htmlFor="landArea" className={labelCls}>Yer maydoni (sotix)</label>
                <input id="landArea" name="landArea" type="number" min={0.01} step="any" value={landArea} onChange={(event) => setLandArea(event.target.value)} className={inputCls} />
              </div>
            )}
            {isOffice && (
              <>
                <div>
                  <label htmlFor="buildingType" className={labelCls}>Bino turi</label>
                  <input id="buildingType" name="buildingType" maxLength={100} value={buildingType} onChange={(event) => setBuildingType(event.target.value)} placeholder="Biznes markaz, alohida bino..." className={inputCls} />
                </div>
                <div>
                  <label htmlFor="electricityPower" className={labelCls}>Elektr quvvati (kW)</label>
                  <input id="electricityPower" name="electricityPower" type="number" min={1} step={1} value={electricityPower} onChange={(event) => setElectricityPower(event.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="entrance" className={labelCls}>Kirish joyi</label>
                  <input id="entrance" name="entrance" maxLength={100} value={entrance} onChange={(event) => setEntrance(event.target.value)} placeholder="Alohida kirish..." className={inputCls} />
                </div>
              </>
            )}
            {isRental && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="deposit" className={labelCls}>Depozit summasi</label>
                  <input id="deposit" name="deposit" type="number" min={0} step="any" value={deposit} onChange={(event) => setDeposit(event.target.value)} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="utilitiesCondition" className={labelCls}>Kommunal to&apos;lovlar sharti</label>
                  <input id="utilitiesCondition" name="utilitiesCondition" maxLength={200} value={utilitiesCondition} onChange={(event) => setUtilitiesCondition(event.target.value)} placeholder="Narx ichida / alohida..." className={inputCls} />
                </div>
              </div>
            )}
          </div>
        </details>

        {images.length > 0 && (
          <div className="rounded-2xl border border-green-100 bg-green-50/70 p-4">
            <button
              type="button"
              onClick={improveListingCopy}
              disabled={isImprovingCopy || title.trim().length < 5 || description.trim().length < 20}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImprovingCopy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isImprovingCopy ? "AI tahrir qilmoqda..." : "AI bilan yaxshilash"}
            </button>
          </div>
        )}
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
              onAddressChange={setAddress}
              center={coordinates ? [coordinates.lat, coordinates.lng] : undefined}
            />
          )}
          <input type="hidden" name="latitude" value={coordinates?.lat ?? ""} />
          <input type="hidden" name="longitude" value={coordinates?.lng ?? ""} />

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
            {(hasGas || hasWater || hasElectricity || hasSewage || renovation) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {hasGas && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">Gaz</span>}
                {hasWater && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">Suv</span>}
                {hasElectricity && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">Svet</span>}
                {hasSewage && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-800">Kanalizatsiya</span>}
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-xl gap-2 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:max-w-none lg:py-0">
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
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 font-bold text-white transition hover:bg-green-800"
            >
              Keyingisi <ChevronRight className="h-4 w-4" />
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
      </div>
      <p className="text-center text-[11px] text-gray-400">
        Qoralama avtomatik saqlanadi. E&apos;lon moderatsiyadan so&apos;ng saytda ko&apos;rinadi.
      </p>
    </form>
  )
}
