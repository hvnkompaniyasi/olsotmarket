"use client"
import Image from "next/image"
import { Loader2, Sparkles } from "lucide-react"

const errorCls = "mt-1 text-xs text-red-600 dark:text-red-400"

interface Props {
  images: string[]; title: string; price: string; currency: string;
  region: string; district: string; address: string;
  hasGas: boolean | null; hasWater: boolean | null; hasElectricity: boolean | null; hasSewage: boolean | null;
  renovation: string; parking: boolean; elevator: boolean; furniture: boolean;
  wifi: boolean; airConditioning: boolean; security: boolean; description: string;
  improveListingCopy: () => void; isImprovingCopy: boolean; aiError: string;
}

export default function ListingPreview(props: Props) {
  return (
    <section className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">E&apos;lonni ko&apos;rib chiqish</h2>
          <p className="text-xs text-gray-500">Saytda ko&apos;rinishidan oldingi taxminiy ko&apos;rinish</p>
        </div>
        <button type="button" onClick={props.improveListingCopy} disabled={props.isImprovingCopy || props.title.trim().length < 3}
          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-800 disabled:opacity-50">
          {props.isImprovingCopy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {props.isImprovingCopy ? "AI tahrir qilmoqda..." : "AI bilan yaxshilash"}
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
        {props.images[0] ? (
          <div className="relative h-48 w-full bg-gray-100">
            <Image src={props.images[0]} alt="Preview" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-36 items-center justify-center bg-gray-50 text-sm text-gray-400">Rasm tanlanmagan</div>
        )}
        <div className="space-y-2 p-4">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{props.title || "Sarlavha"}</p>
          <p className="text-lg font-extrabold text-green-700">
            {props.price && Number.isFinite(Number(props.price))
              ? props.currency === "USD" ? `$${Number(props.price).toLocaleString("uz-UZ")}` : `${Number(props.price).toLocaleString("uz-UZ")} so'm`
              : "Narx yo'q"}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {[props.region, props.district, props.address].filter(Boolean).join(", ") || "Manzil yo'q"}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {props.hasGas && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Gaz</span>}
            {props.hasWater && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Suv</span>}
            {props.hasElectricity && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Svet</span>}
            {props.hasSewage && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Kanalizatsiya</span>}
            {props.renovation && <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">Ta&apos;mir: {props.renovation}</span>}
            {props.furniture && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Mebel</span>}
            {props.elevator && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Lift</span>}
            {props.parking && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Parking</span>}
            {props.wifi && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Wi-Fi</span>}
            {props.airConditioning && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Konditsioner</span>}
            {props.security && <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-800">Xavfsizlik</span>}
          </div>
          {props.description && <p className="line-clamp-3 pt-1 text-sm text-gray-600 dark:text-gray-300">{props.description}</p>}
        </div>
      </div>
      {props.aiError && <p className={errorCls}>{props.aiError}</p>}
    </section>
  )
}