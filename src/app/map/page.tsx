"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Map, { Marker, Popup, type MapRef } from "react-map-gl/maplibre"
import * as Sentry from "@sentry/nextjs"
import { ArrowLeft, SlidersHorizontal, LocateFixed, Plus, Minus, X, Loader2, MapPin } from "lucide-react"
import { REGIONS, DEAL_TYPES } from "@/lib/locations"
import { formatPrice } from "@/lib/format"
import MobileNav from "@/components/MobileNav"
import { MAPLIBRE_WORKER_URL } from "@/lib/maplibre-worker"

interface MapListing {
  id: string
  title: string
  price: number
  currency: string // QO'SHILDI
  region: string
  district: string
  images: string[]
  type: string
  latitude: number | null
  longitude: number | null
}

interface Coordinates {
  latitude: number
  longitude: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isMapListing(value: unknown): value is MapListing {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.price === "number" &&
    typeof value.currency === "string" &&
    typeof value.region === "string" &&
    typeof value.district === "string" &&
    Array.isArray(value.images) &&
    value.images.every((image) => typeof image === "string") &&
    typeof value.type === "string" &&
    (typeof value.latitude === "number" || value.latitude === null) &&
    (typeof value.longitude === "number" || value.longitude === null)
  )
}

export default function MapPage() {
  const mapRef = useRef<MapRef>(null)
  const [ready, setReady] = useState(false)
  const [listings, setListings] = useState<MapListing[]>([])
  const [region, setRegion] = useState("")
  const [deal, setDeal] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [toast, setToast] = useState("")
  const [selected, setSelected] = useState<MapListing | null>(null)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2500)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const loadListings = async () => {
      const params = new URLSearchParams()
      if (region) params.set("region", region)
      if (deal) params.set("deal", deal)

      try {
        const response = await fetch(`/api/listings?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Listings API status ${response.status}`)
        const data: unknown = await response.json()
        const items = isRecord(data) && Array.isArray(data.listings) ? data.listings : []
        setListings(items.filter(isMapListing).filter((listing) => (
          listing.latitude !== null && listing.longitude !== null
        )))
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setListings([])
          showToast("E'lonlarni yuklab bo'lmadi")
          Sentry.captureException(error) // Xatoni Sentry'ga yuborish
        }
      }
    }

    void loadListings()
    return () => controller.abort()
  }, [deal, region, showToast])

  useEffect(() => {
    if (!ready || listings.length === 0) return
    const positionedListings = listings.filter(
      (listing): listing is MapListing & { latitude: number; longitude: number } =>
        listing.latitude !== null && listing.longitude !== null,
    )
    if (positionedListings.length === 0) return
    const longitudes = positionedListings.map((listing) => listing.longitude)
    const latitudes = positionedListings.map((listing) => listing.latitude)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ]
    mapRef.current?.fitBounds(bounds, { padding: 60, maxZoom: 14 })
  }, [listings, ready])

  const activeListing = listings.find((listing) => listing.id === selected?.id)

  const locate = () => {
    if (!navigator.geolocation) {
      showToast("Brauzeringiz joylashuvni qo'llab-quvvatlamaydi")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { latitude: coords.latitude, longitude: coords.longitude }
        setUserLocation(location)
        mapRef.current?.flyTo({ center: [location.longitude, location.latitude], zoom: 13 })
        setLocating(false)
        showToast("📍 Joylashuvingiz belgilandi")
      },
      () => {
        setLocating(false)
        showToast("Joylashuv ruxsati berilmadi")
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  const fabCls = "w-11 h-11 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-700 flex items-center justify-center text-gray-700 dark:text-gray-200 active:scale-95 transition-all"

  return (
    <div className="fixed inset-0 z-40 overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      <div className="pointer-events-auto absolute inset-0 z-0">
        <Map
          ref={mapRef}
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          workerUrl={MAPLIBRE_WORKER_URL}
          initialViewState={{ longitude: 69.2797, latitude: 41.3111, zoom: 6 }}
          onLoad={() => setReady(true)}
          onError={(event) => Sentry.captureException(event.error)}
          interactive
          dragPan
          scrollZoom
          doubleClickZoom
          touchZoomRotate
          style={{ width: "100%", height: "100%" }}
        >
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            longitude={listing.longitude ?? 69.2797}
            latitude={listing.latitude ?? 41.3111}
            anchor="bottom"
          >
            <button
              type="button"
              onClick={() => setSelected(listing)}
              className="whitespace-nowrap rounded-full border-2 border-white bg-[#0A7C4E] px-3 py-1.5 text-xs font-bold text-white shadow-[0_4px_14px_rgba(10,124,78,0.4)] hover:scale-105 transition-transform"
              aria-label={`E'lon narxi: ${formatPrice(listing.price, listing.currency || "UZS")}`}
            >
              {/* XATO TUZATILDI: formatPrice va valyuta ishlatildi */}
              {formatPrice(listing.price, listing.currency || "UZS")}
            </button>
          </Marker>
        ))}
        {activeListing && activeListing.latitude !== null && activeListing.longitude !== null && (
          <Popup
            longitude={activeListing.longitude}
            latitude={activeListing.latitude}
            anchor="bottom"
            onClose={() => setSelected(null)}
            closeOnClick={false}
          >
            <div className="w-[200px]">
              {activeListing.images[0] && (
                <div className="relative mb-2 h-[120px] overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={activeListing.images[0]}
                    alt={activeListing.title}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
              )}
              <p className="mb-1 text-[13px] font-bold line-clamp-2 leading-tight text-gray-900 dark:text-white">
                {activeListing.title || "Sarlavhasiz"}
              </p>
              <p className="text-[15px] font-extrabold text-[#0A7C4E] dark:text-emerald-500">
                {/* XATO TUZATILDI: formatPrice */}
                {formatPrice(activeListing.price, activeListing.currency || "UZS")}
              </p>
              <p className="my-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                {activeListing.region}{activeListing.district ? `, ${activeListing.district}` : ""}
              </p>
              <Link
                href={`/listing/${encodeURIComponent(activeListing.id)}`}
                className="block rounded-lg bg-[#0A7C4E] p-2 text-center text-xs font-bold text-white hover:bg-[#086339] transition-colors"
              >
                Batafsil ko&apos;rish
              </Link>
            </div>
          </Popup>
        )}
        {userLocation && (
          <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
            <span className="user-dot" aria-label="Sizning joylashuvingiz" />
          </Marker>
        )}
        </Map>
      </div>

      {!ready && (
        <div className="pointer-events-none absolute inset-0 z-[400] flex items-center justify-center bg-[#F7FBF8] dark:bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-[#0A7C4E]" />
        </div>
      )}

      <div className="absolute left-3 right-3 top-3 z-[500] flex items-center gap-2">
        <Link href="/listings" className={fabCls} aria-label="Orqaga">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-white/95 px-4 shadow-xl backdrop-blur-xl dark:border-zinc-700 dark:bg-zinc-900/95">
          <MapPin className="h-4 w-4 flex-shrink-0 text-[#0A7C4E]" />
          <span className="truncate text-sm font-semibold text-gray-700 dark:text-gray-200">
            Xaritadagi e&apos;lonlar: {listings.length}
          </span>
        </div>
        <button onClick={() => setSheetOpen(true)} className={fabCls} aria-label="Filtrlar">
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {toast && (
        <div role="status" className="absolute left-1/2 top-16 z-[600] -translate-x-1/2 rounded-full bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-4">
          {toast}
        </div>
      )}

      <div className="absolute bottom-24 right-3 z-[500] flex flex-col gap-2">
        <button onClick={locate} className={fabCls} aria-label="O'zim turgan joy">
          {locating ? <Loader2 className="h-5 w-5 animate-spin text-[#0A7C4E]" /> : <LocateFixed className="h-5 w-5 text-[#0A7C4E]" />}
        </button>
        <button onClick={() => mapRef.current?.zoomIn()} className={fabCls} aria-label="Yaqinlashtirish">
          <Plus className="h-5 w-5" />
        </button>
        <button onClick={() => mapRef.current?.zoomOut()} className={fabCls} aria-label="Uzoqlashtirish">
          <Minus className="h-5 w-5" />
        </button>
      </div>

      {sheetOpen && (
        <div className="absolute inset-0 z-[700] bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setSheetOpen(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl dark:bg-zinc-900 animate-in slide-in-from-bottom"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300 dark:bg-zinc-700" />
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filtrlar</h3>
              <button onClick={() => setSheetOpen(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="Yopish">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Hudud</label>
                <select value={region} onChange={(event) => setRegion(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none focus:border-[#0A7C4E] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="">Barcha hududlar</option>
                  {REGIONS.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-300">Bitim turi</label>
                <select value={deal} onChange={(event) => setDeal(event.target.value)} className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none focus:border-[#0A7C4E] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                  <option value="">Barcha turlar</option>
                  {DEAL_TYPES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setRegion(""); setDeal("") }} className="h-12 flex-1 rounded-xl bg-gray-100 text-sm font-bold text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 transition-colors">
                  Tozalash
                </button>
                <button onClick={() => setSheetOpen(false)} className="h-12 flex-1 rounded-xl bg-[#0A7C4E] text-sm font-bold text-white shadow-lg shadow-green-500/30 hover:bg-[#086339] transition-colors">
                  Ko&apos;rish ({listings.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <MobileNav />
    </div>
  )
}