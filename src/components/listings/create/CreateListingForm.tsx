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

  useEffect(() => {
    const controller = new AbortController()
    fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/", { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json()
        const usd = data.find((i: any) => i.Ccy === "USD")
        if (usd) setUsdRate(Number(usd.Rate.replace(/\s/g, "").replace(",", ".")))
      })
      .catch(() => setExchangeRateError("Markaziy bank kursini yuklab bo'lmadi"))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(draftKey) ?? "null")
        if (isRecord(stored) && isRecord(stored.fields)) {
          const f = stored.fields
          setTitle(typeof f.title === "string" ? f.title : "")
          setPrice(typeof f.price === "string" ? f.price : "")
          setCurrency(typeof f.currency === "string" ? f.currency : "USD")
          setListingType(typeof f.type === "string" ? f.type : "SALE")
          setCategory(typeof f.category === "string" ? f.category : "APARTMENT")
          setRegion(typeof f.region === "string" ? f.region : "")
          setDistrict(typeof f.district === "string" ? f.district : "")
          setAddress(typeof f.address === "string" ? f.address : "")
          setDescription(typeof f.description === "string" ? f.description : "")
          setRooms(typeof f.rooms === "string" ? f.rooms : "")
          setArea(typeof f.area === "string" ? f.area : "")
          setLivingArea(typeof f.livingArea === "string" ? f.livingArea : "")
          setLandArea(typeof f.landArea === "string" ? f.landArea : "")
          setPurpose(typeof f.purpose === "string" ? f.purpose : "")
          setBuildingType(typeof f.buildingType === "string" ? f.buildingType : "")
          setElectricityPower(typeof f.electricityPower === "string" ? f.electricityPower : "")
          setEntrance(typeof f.entrance === "string" ? f.entrance : "")
          setBathroom(typeof f.bathroom === "string" ? f.bathroom : "")
          setDeposit(typeof f.deposit === "string" ? f.deposit : "")
          setUtilitiesCondition(typeof f.utilitiesCondition === "string" ? f.utilitiesCondition : "")
          setFloor(typeof f.floor === "string" ? f.floor : "")
          setTotalFloors(typeof f.totalFloors === "string" ? f.totalFloors : "")
          setRenovation(typeof f.renovation === "string" ? f.renovation : "")
          setImages(Array.isArray(stored.images) ? stored.images.filter((i): i is string => typeof i === "string") : [])
          setHasGas(draftBoolean(f.hasGas)); setHasWater(draftBoolean(f.hasWater)); setHasElectricity(draftBoolean(f.hasElectricity)); setHasSewage(draftBoolean(f.hasSewage))
          setParking(f.parking === true); setElevator(f.elevator === true); setFurniture(f.furniture === true)
          setWifi(f.wifi === true); setAirConditioning(f.airConditioning === true); setSecurity(f.security === true)
          if (typeof f.latitude === "string" && typeof f.longitude === "string") setCoordinates({ lat: Number(f.latitude), lng: Number(f.longitude) })
        }
      } catch { setDraftError("Qoralamani tiklash imkoni bo'lmadi") }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  const saveDraft = useCallback(() => {
    if (!formRef.current) return
    const fields: Record<string, DraftValue> = {}
    for (const control of formRef.current.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]")) {
      fields[control.name] = control instanceof HTMLInputElement && control.type === "checkbox" ? control.checked : control.value
    }
    try { localStorage.setItem(draftKey, JSON.stringify({ fields, images })) } catch {}
  }, [images])

  // DARHOL SAQLASH (XATO TUZATILDI)
  useEffect(() => {
    if (!hydrated) return
    saveDraft() 
  }, [hydrated, title, price, currency, listingType, category, region, district, address, description, rooms, area, livingArea, landArea, purpose, buildingType, electricityPower, entrance, bathroom, deposit, utilitiesCondition, floor, totalFloors, renovation, images, coordinates, hasGas, hasWater, hasElectricity, hasSewage, parking, elevator, furniture, wifi, airConditioning, security, saveDraft])

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
    setFieldErrors((c) => ({ ...c, ...errors }))
    return Object.keys(errors).length === 0
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (uploading) { setClientError("Rasmlar yuklanishi tugashini kuting"); setStep(1); return }
    for (const t of [0, 1]) { if (!validateStep(t)) { setStep(t); return } }
    setClientError(""); setSubmitting(true)
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      try {
        const result = await createListingAction(INITIAL_CREATE_LISTING_STATE, formData)
        if (result) setState(result)
      } catch (error: any) {
        if (String(error?.digest).startsWith("NEXT_REDIRECT")) { localStorage.removeItem(draftKey); throw error }
        setClientError("Xatolik yuz berdi")
      } finally { setSubmitting(false) }
    })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} onChange={() => saveDraft()} noValidate className="space-y-4 pb-24 lg:pb-0">
      {(state.error || clientError) && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" /><span>{clientError || state.error}</span></div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-green-700">Bosqich {step + 1} / 2</p>
        <h2 className="text-base font-bold text-gray-900">{steps[step]}</h2>
        <div className="mt-2 h-2 rounded-full bg-gray-100"><div className="h-full bg-green-700 rounded-full" style={{ width: `${((step + 1) / 2) * 100}%` }} /></div>
        {slug && <p className="mt-2 text-[11px] text-gray-500">SEO URL: {slug}</p>}
      </div>

      <section className={`${step === 0 ? "block" : "hidden"} space-y-4`}>
        <Step1BasicInfo title={title} setTitle={setTitle} description={description} setDescription={setDescription} listingType={listingType} setListingType={setListingType} category={category} setCategory={setCategory} price={price} setPrice={setPrice} currency={currency} setCurrency={setCurrency} rooms={rooms} setRooms={setRooms} floor={floor} setFloor={setFloor} totalFloors={totalFloors} setTotalFloors={setTotalFloors} usdRate={usdRate} exchangeRateError={exchangeRateError} isApartment={isApartment} isHouse={isHouse} getFieldError={getFieldError} setTouchedFields={setTouchedFields} />
        <Step1Features hasGas={hasGas} setHasGas={setHasGas} hasWater={hasWater} setHasWater={setHasWater} hasElectricity={hasElectricity} setHasElectricity={setHasElectricity} hasSewage={hasSewage} setHasSewage={setHasSewage} parking={parking} setParking={setParking} elevator={elevator} setElevator={setElevator} furniture={furniture} setFurniture={setFurniture} wifi={wifi} setWifi={setWifi} airConditioning={airConditioning} setAirConditioning={setAirConditioning} security={security} setSecurity={setSecurity} area={area} setArea={setArea} livingArea={livingArea} setLivingArea={setLivingArea} landArea={landArea} setLandArea={setLandArea} purpose={purpose} setPurpose={setPurpose} buildingType={buildingType} setBuildingType={setBuildingType} electricityPower={electricityPower} setElectricityPower={setElectricityPower} entrance={entrance} setEntrance={setEntrance} bathroom={bathroom} setBathroom={setBathroom} deposit={deposit} setDeposit={setDeposit} utilitiesCondition={utilitiesCondition} setUtilitiesCondition={setUtilitiesCondition} renovation={renovation} setRenovation={setRenovation} isApartment={isApartment} isHouse={isHouse} isLand={isLand} isOffice={isOffice} isRental={isRental} getFieldError={getFieldError} setTouchedFields={setTouchedFields} />
      </section>

      <section className={`${step === 1 ? "block" : "hidden"} space-y-4`}>
        <Step2Location images={images} setImages={setImages} setUploading={setUploading} setFieldErrors={setFieldErrors} draftId={draftId} storageReady={storageReady} region={region} setRegion={setRegion} district={district} setDistrict={setDistrict} address={address} setAddress={setAddress} coordinates={coordinates} setCoordinates={setCoordinates} getFieldError={getFieldError} setTouchedFields={setTouchedFields} />
        <ListingPreview images={images} title={title} price={price} currency={currency} region={region} district={district} address={address} hasGas={hasGas} hasWater={hasWater} hasElectricity={hasElectricity} hasSewage={hasSewage} renovation={renovation} parking={parking} elevator={elevator} furniture={furniture} wifi={wifi} airConditioning={airConditioning} security={security} description={description} improveListingCopy={() => {}} isImprovingCopy={false} aiError={aiError} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white p-4 lg:static lg:bg-transparent">
        <div className="flex gap-2">
          {step > 0 && <button type="button" onClick={() => setStep((c) => c - 1)} className="flex-1 rounded-xl border py-3 font-semibold"><ChevronLeft className="inline h-4 w-4" /> Ortga</button>}
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => { if (validateStep(step)) setStep((c) => c + 1) }} className="flex-1 rounded-xl bg-green-700 py-3 font-bold text-white">Keyingisi <ChevronRight className="inline h-4 w-4" /></button>
          ) : (
            <button type="submit" disabled={isPending || submitting} className="flex-1 rounded-xl bg-green-800 py-3 font-bold text-white">{isPending || submitting ? <Loader2 className="inline h-5 w-5 animate-spin" /> : "E'lonni joylash"}</button>
          )}
        </div>
      </div>
    </form>
  )
}