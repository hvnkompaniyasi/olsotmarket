"use client"
import { useState } from "react"
import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import { REGIONS, getDistricts } from "@/lib/locations"
import ListingImageUploader from "../ListingImageUploader"
import type { Coordinates } from "../MapPicker"

const MapPicker = dynamic(() => import("../MapPicker"), { ssr: false })

const inputCls = "h-12 w-full px-4 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-[#0A7C4E]"
const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block"
const errorCls = "mt-1 text-xs text-red-600 dark:text-red-400"

interface Props {
  images: string[]; setImages: (v: string[]) => void;
  setUploading: (v: boolean) => void;
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  draftId: string; storageReady: boolean;
  region: string; setRegion: (v: string) => void;
  district: string; setDistrict: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  coordinates: Coordinates | null; setCoordinates: (v: Coordinates | null) => void;
  getFieldError: (name: string) => string;
  setTouchedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function Step2Location(props: Props) {
  const [mapOpen, setMapOpen] = useState(false)
  const districts = getDistricts(props.region)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <ListingImageUploader
          images={props.images} onChange={props.setImages} onBusyChange={props.setUploading}
          onError={(msg) => props.setFieldErrors((c) => ({ ...c, images: msg }))}
          draftId={props.draftId} disabled={!props.storageReady}
        />
        {props.getFieldError("images") && <p className={errorCls}>{props.getFieldError("images")}</p>}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="region" className={labelCls}>Viloyat *</label>
            <select id="region" name="region" value={props.region} onChange={(e) => { props.setRegion(e.target.value); props.setDistrict("") }}
              onBlur={() => props.setTouchedFields(prev => ({ ...prev, region: true }))} className={inputCls}>
              <option value="">Tanlang</option>
              {REGIONS.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
            {props.getFieldError("region") && <p className={errorCls}>{props.getFieldError("region")}</p>}
          </div>
          <div>
            <label htmlFor="district" className={labelCls}>Tuman *</label>
            <select id="district" name="district" value={props.district} onChange={(e) => props.setDistrict(e.target.value)}
              onBlur={() => props.setTouchedFields(prev => ({ ...prev, district: true }))} disabled={!props.region} className={inputCls}>
              <option value="">{props.region ? "Tanlang" : "Avval viloyat"}</option>
              {districts.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {props.getFieldError("district") && <p className={errorCls}>{props.getFieldError("district")}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="address" className={labelCls}>Manzil *</label>
          <input id="address" name="address" value={props.address} onChange={(e) => props.setAddress(e.target.value)}
            onBlur={() => props.setTouchedFields(prev => ({ ...prev, address: true }))} placeholder="Ko'cha, uy raqami" className={inputCls} />
          {props.getFieldError("address") && <p className={errorCls}>{props.getFieldError("address")}</p>}
        </div>

        <button type="button" onClick={() => setMapOpen(o => !o)} className="inline-flex items-center gap-2 rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-800 hover:bg-green-50">
          <MapPin className="h-4 w-4" /> {mapOpen ? "Xaritani yopish" : "Xaritada belgilash"}
        </button>

        {mapOpen && (
          <MapPicker value={props.coordinates} onChange={props.setCoordinates} onAddressChange={props.setAddress}
            center={props.coordinates ? [props.coordinates.lat, props.coordinates.lng] : undefined}
            onClose={() => { setMapOpen(false); props.setCoordinates(null) }} />
        )}
        <input type="hidden" name="latitude" value={props.coordinates?.lat ?? ""} />
        <input type="hidden" name="longitude" value={props.coordinates?.lng ?? ""} />
      </div>
    </div>
  )
}