"use client"

import { useCallback, useRef, useState } from "react"
import Map, { type MapRef, type ViewStateChangeEvent } from "react-map-gl/maplibre"
import { LocateFixed, Loader2 } from "lucide-react"
import { MAPLIBRE_WORKER_URL } from "@/lib/maplibre-worker"

interface LocationPickerProps {
  lat: number | null
  lng: number | null
  onChange: (lat: number, lng: number) => void
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const mapRef = useRef<MapRef>(null)
  const [locating, setLocating] = useState(false)

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      onChange(event.viewState.latitude, event.viewState.longitude)
    },
    [onChange],
  )

  const locate = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 16,
        })
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }

  return (
    <div className="relative h-52 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
      <Map
        ref={mapRef}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        workerUrl={MAPLIBRE_WORKER_URL}
        initialViewState={{
          longitude: lng ?? 69.2797,
          latitude: lat ?? 41.3111,
          zoom: lat !== null && lng !== null ? 16 : 14,
        }}
        onMoveEnd={handleMoveEnd}
        style={{ width: "100%", height: "100%" }}
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <svg width="40" height="40" viewBox="0 0 24 24" className="drop-shadow-xl" aria-hidden="true">
          <path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            fill="#0A7C4E"
            stroke="#fff"
            strokeWidth="1.2"
          />
          <circle cx="12" cy="9" r="2.8" fill="#fff" />
        </svg>
      </div>

      <button
        type="button"
        onClick={locate}
        className="absolute right-2.5 top-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-blue-500 shadow-lg transition-transform active:scale-95 dark:border-zinc-700 dark:bg-zinc-900"
        aria-label="Joylashuvimni topish"
      >
        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
      </button>

      <div className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
        <svg width="12" height="12" viewBox="0 0 24 24" className="mt-0.5 flex-shrink-0" fill="#0A7C4E" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        </svg>
        <span>
          {lat !== null && lng !== null
            ? `Manzil: ${lat.toFixed(5)}, ${lng.toFixed(5)} — xaritani surib aniqlashtiring`
            : "Xaritani suring — 📍 belgi markazda turadi, siljigan joy manzil bo'ladi"}
        </span>
      </div>
    </div>
  )
}
