"use client"
import { DEAL_TYPES, PROPERTY_CATEGORIES } from "@/lib/locations"

const inputCls = "h-12 w-full px-4 bg-white/90 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-[#0A7C4E]"
const labelCls = "text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block"
const errorCls = "mt-1 text-xs text-red-600 dark:text-red-400"

interface Props {
  title: string; setTitle: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  listingType: string; setListingType: (v: string) => void;
  category: string; setCategory: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  currency: string; setCurrency: (v: string) => void;
  rooms: string; setRooms: (v: string) => void;
  floor: string; setFloor: (v: string) => void;
  totalFloors: string; setTotalFloors: (v: string) => void;
  usdRate: number | null; exchangeRateError: string;
  isApartment: boolean; isHouse: boolean;
  getFieldError: (name: string) => string;
  setTouchedFields: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export default function Step1BasicInfo({
  title, setTitle, description, setDescription, listingType, setListingType,
  category, setCategory, price, setPrice, currency, setCurrency, rooms, setRooms,
  floor, setFloor, totalFloors, setTotalFloors, usdRate, exchangeRateError,
  isApartment, isHouse, getFieldError, setTouchedFields
}: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <label htmlFor="title" className={labelCls}>E&apos;lon sarlavhasi *</label>
          <input
            id="title" name="title" required minLength={3} maxLength={120}
            value={title} onChange={(e) => setTitle(e.target.value)}
            onBlur={() => setTouchedFields((prev) => ({ ...prev, title: true }))}
            placeholder="Masalan: Chilonzorda 3 xonali kvartira"
            className={inputCls} aria-invalid={Boolean(getFieldError("title"))}
          />
          {getFieldError("title") && <p className={errorCls}>{getFieldError("title")}</p>}
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label htmlFor="description" className={labelCls}>Tavsif</label>
            <span className="text-xs text-gray-400">{description.length}/2000</span>
          </div>
          <textarea
            id="description" name="description" rows={4} maxLength={2000}
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Uy yoki xonadon haqida batafsil yozing..."
            className={`${inputCls} h-auto resize-y py-3`}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type" className={labelCls}>Bitim turi *</label>
            <select id="type" name="type" value={listingType} onChange={(e) => setListingType(e.target.value)} className={inputCls}>
              {DEAL_TYPES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="category" className={labelCls}>Kategoriya *</label>
            <select id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {PROPERTY_CATEGORIES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="price" className={labelCls}>Narx *</label>
          <div className="flex gap-2">
            <input
              id="price" name="price" type="number" min={1} step="any"
              value={price} onChange={(e) => setPrice(e.target.value)}
              onBlur={() => setTouchedFields((prev) => ({ ...prev, price: true }))}
              placeholder="Narxni kiriting" className={`${inputCls} min-w-0 flex-1`}
              aria-invalid={Boolean(getFieldError("price"))}
            />
            <div className="flex shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-1 dark:border-zinc-700 dark:bg-zinc-800">
              {(["USD", "UZS"] as const).map((item) => (
                <button
                  key={item} type="button" aria-pressed={currency === item}
                  onClick={() => setCurrency(item)}
                  className={`min-w-14 rounded-lg px-2 text-xs font-bold transition ${
                    currency === item ? "bg-green-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 dark:text-gray-300"
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
              <label htmlFor="rooms" className={labelCls}>Xonalar soni</label>
              <input id="rooms" name="rooms" type="number" min={0} max={20} step={1} value={rooms} onChange={(e) => setRooms(e.target.value)} placeholder="Masalan, 3" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {isApartment && (
                <div>
                  <label htmlFor="floor" className={labelCls}>Qavat</label>
                  <input id="floor" name="floor" type="number" min={0} max={200} step={1} value={floor} onChange={(e) => setFloor(e.target.value)} className={inputCls} placeholder="Masalan, 3" />
                </div>
              )}
              <div>
                <label htmlFor="totalFloors" className={labelCls}>Bino qavati</label>
                <input id="totalFloors" name="totalFloors" type="number" min={1} max={200} step={1} value={totalFloors} onChange={(e) => setTotalFloors(e.target.value)} className={inputCls} placeholder="Masalan, 9" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}