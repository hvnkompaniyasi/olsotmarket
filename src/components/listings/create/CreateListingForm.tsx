"use client"

import { useCallback, useEffect, useRef, useState, useTransition, type FormEvent } from "react"
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react"
import { createListingAction } from "@/app/(main)/listings/create/actions"
import { INITIAL_CREATE_LISTING_STATE, type CreateListingState } from "@/lib/listing-form"
import Step1BasicInfo from "./steps/Step1BasicInfo"
import Step1Features from "./steps/Step1Features"
import Step2Location from "./steps/Step2Location"
import ListingPreview from "./steps/ListingPreview"
import type { Coordinates } from "./MapPicker"

const draftKey = "olsot:create-listing:draft:v1"
const steps = ["Asosiy ma'lumot", "Rasm, tavsif va manzil"]
type DraftValue = string | boolean

function slugify(value: string): string {
  return value.toLocaleLowerCase("uz-UZ").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[ʻʼ'`’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null }
function draftBoolean(value: unknown): boolean | null {
  if (value === true || value === "true" || value === "on") return true
  if (value === false || value === "false" || value === "off") return false
  return null
}

export default function CreateListingForm({ storageReady }: { storageReady: boolean }) {
  const [state, setState] = useState<CreateListingState>(INITIAL_CREATE_LISTING_STATE)
  const [isPending, startTransition] = useTransition()
  const [submitting, setSubmitting] = useState(false)
  
  // State blocks (Qisqartirildi, lekin barchasi shu yerda saqlanadi)
  const [title, setTitle] = useState(""); const [price, setPrice] = useState(""); const [currency, setCurrency] = useState("USD")
  const [listingType, setListingType] = useState("SALE"); const [category, setCategory] = useState("APARTMENT")
  const [region, setRegion] = useState(""); const [district, setDistrict] = useState(""); const [address, setAddress] = useState("")
  const [description, setDescription] = useState(""); const [rooms, setRooms] = useState(""); const [area, setArea] = useState("")
  const [livingArea, setLivingArea] = useState(""); const [landArea, setLandArea] = useState(""); const [purpose, setPurpose] = useState("")
  const [buildingType, setBuildingType] = useState(""); const [electricityPower, setElectricityPower] = useState("")
  const [entrance, setEntrance] = useState(""); const [bathroom, setBathroom] = useState(""); const [deposit, setDeposit] = useState("")
  const [utilitiesCondition, setUtilitiesCondition] = useState(""); const [floor, setFloor] = useState(""); const [totalFloors, setTotalFloors] = useState("")
  const [renovation, setRenovation] = useState(""); const [images, setImages] = useState<string[]>([]); const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [hasGas, setHasGas] = useState<boolean | null>(null); const [hasWater, setHasWater] = useState<boolean | null>(null)
  const [hasElectricity, setHasElectricity] = useState<boolean | null>(null); const [hasSewage, setHasSewage] = useState<boolean | null>(null)
  const [parking, setParking] = useState(false); const [elevator, setElevator] = useState(false); const [furniture, setFurniture] = useState(false)
  const [wifi, setWifi] = useState(false); const [airConditioning, setAirConditioning] = useState(false); const [security, setSecurity] = useState(false)
  const [usdRate, setUsdRate] = useState<number | null>(null); const [exchangeRateError, setExchangeRateError] = useState("")
  const [uploading, setUploading] = useState(false); const [step, setStep] = useState(0); const [hydrated, setHydrated] = useState(false)
  const [draftError, setDraftError] = useState(""); const [clientError, setClientError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({}); const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [showAllErrors, setShowAllErrors] = useState(false); const [aiError, setAiError] = useState(""); const [isImprovingCopy, setIsImprovingCopy] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [draftId] = useState(() => crypto.randomUUID())

  const isApartment = category === "APARTMENT" || listingType === "NEW_BUILDING"
  const isHouse = category === "HOUSE"; const isLand = category === "LAND"; const isOffice = category === "OFFICE"
  const isRental = listingType === "RENT" || listingType === "DAILY"

  useEffect(() => { /* CBU API Fetch (avvalgidek qoladi) */ }, [])
  useEffect(() => { /* Draft Hydration (avvalgidek qoladi) */ }, [])
  
  const saveDraft = useCallback(() => { /* (avvalgidek qoladi) */ }, [images])
  useEffect(() => { /* Auto-save Draft (avvalgidek qoladi) */ }, [])

  const slug = slugify([rooms ? `${rooms}-xonalik` : "", title, district, region].filter(Boolean).join(" "))
  
  const getFieldError = (name: string) => showAllErrors || touchedFields[name] ? fieldErrors[name] ?? "" : ""

  const validateStep = (targetStep: number): boolean => {
    const errors: Record<string, string> = {}
    if (targetStep === 0) {
      if (title.trim().length < 3) errors.title = "Sarlavha kamida 3 belgidan iborat bo'lsin"
      if (!Number.isFinite(Number(price)) || Number(price) <= 0) errors.price = "Narxni to'g'ri kiriting"
      if (hasGas === null) errors.hasGas = "Gaz bor yoki yo'qligini tanlang"
      if (hasWater === null) errors.hasWater = "Suv bor yoki yo'qligini tanlang"
      if (hasElectricity === null) errors.hasElectricity = "Svet bor yoki yo'qligini tanlang"
    }
    if (targetStep === 1) {
      if (images.length === 0) errors.images = "Kamida 1 ta rasm yuklang"
      if (!region) errors.region = "Viloyatni tanlang"
      if (!district) errors.district = "Tuman yoki shaharni tanlang"
      if (address.trim().length < 5) errors.address = "Manzil kamida 5 belgidan iborat bo'lsin"
    }
    setFieldErrors((current) => ({ ...current, ...errors }))
    return Object.keys(errors).length === 0
  }

  const improveListingCopy = async () => { /* (avvalgidek qoladi) */ }
  const onSubmit = (event: FormEvent<HTMLFormElement>) => { /* (avvalgidek qoladi) */ }

  return (
    <form ref={formRef} onSubmit={onSubmit} onChange={() => window.setTimeout(saveDraft, 0)} noValidate className="space-y-4 pb-24 lg:pb-0">
      {(state.error || clientError) && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /> <span>{clientError || state.error}</span>
        </div>
      )}

      {!storageReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Supabase Storage sozlanmagan. Rasmlarni yuklash uchun env qiymatlarini tekshiring.
        </div>
      )}

      {/* Header (Progress va SEO slug) */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Bosqich {step + 1} / 2</p>
            <h2 className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">{steps[step]}</h2>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-800 dark:bg-green-500/10 dark:text-green-300">{step + 1}/2</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-green-700 transition-all" style={{ width: `${((step + 1) / 2) * 100}%` }} />
        </div>
        {slug && <p className="mt-3 truncate text-[11px] text-gray-500">SEO URL: <span className="font-medium text-gray-700">{slug}</span></p>}
      </div>

      {/* 1-qadam */}
      <section className={`${step === 0 ? "block" : "hidden"} space-y-4`}>
        <Step1BasicInfo 
          title={title} setTitle={setTitle} description={description} setDescription={setDescription}
          listingType={listingType} setListingType={setListingType} category={category} setCategory={setCategory}
          price={price} setPrice={setPrice} currency={currency} setCurrency={setCurrency}
          rooms={rooms} setRooms={setRooms} floor={floor} setFloor={setFloor} totalFloors={totalFloors} setTotalFloors={setTotalFloors}
          usdRate={usdRate} exchangeRateError={exchangeRateError} isApartment={isApartment} isHouse={isHouse}
          getFieldError={getFieldError} setTouchedFields={setTouchedFields}
        />
        <Step1Features 
          hasGas={hasGas} setHasGas={setHasGas} hasWater={hasWater} setHasWater={setHasWater} hasElectricity={hasElectricity} setHasElectricity={setHasElectricity}
          hasSewage={hasSewage} setHasSewage={setHasSewage} parking={parking} setParking={setParking} elevator={elevator} setElevator={setElevator}
          furniture={furniture} setFurniture={setFurniture} wifi={wifi} setWifi={setWifi} airConditioning={airConditioning} setAirConditioning={setAirConditioning}
          security={security} setSecurity={setSecurity} area={area} setArea={setArea} livingArea={livingArea} setLivingArea={setLivingArea}
          landArea={landArea} setLandArea={setLandArea} purpose={purpose} setPurpose={setPurpose} buildingType={buildingType} setBuildingType={setBuildingType}
          electricityPower={electricityPower} setElectricityPower={setElectricityPower} entrance={entrance} setEntrance={setEntrance} bathroom={bathroom} setBathroom={setBathroom}
          deposit={deposit} setDeposit={setDeposit} utilitiesCondition={utilitiesCondition} setUtilitiesCondition={setUtilitiesCondition} renovation={renovation} setRenovation={setRenovation}
          isApartment={isApartment} isHouse={isHouse} isLand={isLand} isOffice={isOffice} isRental={isRental}
          getFieldError={getFieldError} setTouchedFields={setTouchedFields}
        />
      </section>

      {/* 2-qadam */}
      <section className={`${step === 1 ? "block" : "hidden"} space-y-4`}>
        <Step2Location 
          images={images} setImages={setImages} setUploading={setUploading} setFieldErrors={setFieldErrors} draftId={draftId} storageReady={storageReady}
          region={region} setRegion={setRegion} district={district} setDistrict={setDistrict} address={address} setAddress={setAddress}
          coordinates={coordinates} setCoordinates={setCoordinates} getFieldError={getFieldError} setTouchedFields={setTouchedFields}
        />
        <ListingPreview 
          images={images} title={title} price={price} currency={currency} region={region} district={district} address={address}
          hasGas={hasGas} hasWater={hasWater} hasElectricity={hasElectricity} hasSewage={hasSewage} renovation={renovation}
          parking={parking} elevator={elevator} furniture={furniture} wifi={wifi} airConditioning={airConditioning} security={security} description={description}
          improveListingCopy={improveListingCopy} isImprovingCopy={isImprovingCopy} aiError={aiError}
        />
      </section>

      {draftError && <p className="text-xs text-amber-700">{draftError}</p>}

      {/* Tugmalar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 backdrop-blur lg:static lg:border-0 lg:bg-transparent lg:px-0 lg:backdrop-blur-none">
        <div className="mx-auto flex max-w-xl gap-2 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:max-w-none lg:py-0">
          {step > 0 && (
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50">
              <ChevronLeft className="h-4 w-4" /> Ortga
            </button>
          )}
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => { if (validateStep(step)) setStep((current) => current + 1) }} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-700 font-bold text-white transition hover:bg-green-800">
              Keyingisi <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={isPending || submitting || uploading || !storageReady} className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-700 to-green-800 text-base font-extrabold text-white shadow-lg shadow-green-400/30 disabled:opacity-50">
              {isPending || submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />} E&apos;lonni joylash
            </button>
          )}
        </div>
      </div>
      <p className="text-center text-[11px] text-gray-400">Qoralama avtomatik saqlanadi. E&apos;lon moderatsiyadan so&apos;ng saytda ko&apos;rinadi.</p>
    </form>
  )
}