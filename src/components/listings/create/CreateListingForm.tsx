"use client"

import { useState, type FormEvent } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { AlertCircle, Loader2, Plus } from "lucide-react"
import { createListingAction } from "@/app/listings/create/actions"
import { INITIAL_CREATE_LISTING_STATE, type CreateListingState } from "@/lib/listing-form"
import { DEAL_TYPES, PROPERTY_CATEGORIES, REGIONS, getDistricts } from "@/lib/locations"
import ListingImageUploader from "./ListingImageUploader"

const inputCls =
  "h-12 w-full px-4 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-[#0A7C4E]"
const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block"
const errorCls = "mt-1 text-xs text-red-600 dark:text-red-400"

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="h-14 w-full bg-gradient-to-r from-[#0A7C4E] to-[#08623D] text-white rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-green-400/30 disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
      E'lonni joylash
    </button>
  )
}

export default function CreateListingForm({ storageReady }: { storageReady: boolean }) {
  const [state, formAction] = useFormState<CreateListingState, FormData>(
    createListingAction,
    INITIAL_CREATE_LISTING_STATE
  )
  const [region, setRegion] = useState("")
  const [district, setDistrict] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [clientError, setClientError] = useState("")
  const [draftId] = useState(() => crypto.randomUUID())
  const districts = getDistricts(region)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (uploading) {
      event.preventDefault()
      setClientError("Rasmlar yuklanishi tugashini kuting")
      return
    }
    if (images.length === 0) {
      event.preventDefault()
      setClientError("Kamida 1 ta rasm yuklang")
      return
    }
    setClientError("")
  }

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4">
      {(state.error || clientError) && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400 flex gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{clientError || state.error}</span>
        </div>
      )}

      {!storageReady && (
        <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          Supabase Storage sozlanmagan. Rasmlarni yuklash uchun env qiymatlarini tekshiring.
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-3">
        <div>
          <label htmlFor="title" className={labelCls}>Sarlavha *</label>
          <input id="title" name="title" required minLength={5} maxLength={100} placeholder="Masalan: Chilonzorda 3 xonali kvartira" className={inputCls} />
          {state.fieldErrors?.title && <p className={errorCls}>{state.fieldErrors.title[0]}</p>}
        </div>
        <div>
          <label htmlFor="description" className={labelCls}>Tavsif</label>
          <textarea id="description" name="description" rows={4} maxLength={2000} placeholder="E'lon haqida batafsil..." className={`${inputCls} h-auto py-3 resize-none`} />
          {state.fieldErrors?.description && <p className={errorCls}>{state.fieldErrors.description[0]}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="type" className={labelCls}>Bitim turi *</label>
            <select id="type" name="type" defaultValue="SALE" className={inputCls}>
              {DEAL_TYPES.filter((item) => item.id === "SALE" || item.id === "RENT").map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className={labelCls}>Kategoriya *</label>
            <select id="category" name="category" defaultValue="APARTMENT" className={inputCls}>
              {PROPERTY_CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_110px] gap-2.5">
          <div>
            <label htmlFor="price" className={labelCls}>Narx *</label>
            <input id="price" name="price" type="number" required min={1} step="any" placeholder="450000000" className={inputCls} />
            {state.fieldErrors?.price && <p className={errorCls}>{state.fieldErrors.price[0]}</p>}
          </div>
          <div>
            <label htmlFor="currency" className={labelCls}>Valyuta</label>
            <select id="currency" name="currency" defaultValue="UZS" className={inputCls}>
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] space-y-3">
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
            >
              <option value="">Tanlang</option>
              {REGIONS.map((item) => (
                <option key={item.id} value={item.name}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="district" className={labelCls}>Tuman / shahar</label>
            <select
              id="district"
              name="district"
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              disabled={!region}
              className={inputCls}
            >
              <option value="">{region ? "Tanlang" : "Avval viloyat"}</option>
              {districts.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="address" className={labelCls}>Manzil</label>
          <input id="address" name="address" maxLength={200} placeholder="Ko'cha, uy raqami" className={inputCls} />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="rooms" className={labelCls}>Xonalar soni</label>
            <input id="rooms" name="rooms" type="number" min={0} max={20} step={1} className={inputCls} />
          </div>
          <div>
            <label htmlFor="area" className={labelCls}>Maydon (m²)</label>
            <input id="area" name="area" type="number" min={0} step="any" className={inputCls} />
          </div>
        </div>
      </div>

      <ListingImageUploader
        images={images}
        onChange={setImages}
        onBusyChange={setUploading}
        draftId={draftId}
        disabled={!storageReady}
      />

      <SubmitButton disabled={uploading || !storageReady} />
      <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center">
        E'lon moderatsiya tekshiruvidan so'ng saytda ko'rinadi
      </p>
    </form>
  )
}
