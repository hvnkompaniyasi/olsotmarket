"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  type MapLayerMouseEvent,
  type MapRef,
  type MarkerDragEvent,
} from "react-map-gl/maplibre"
// BU YERDAGI CSS IMPORTI O'CHIRILDI
import { MAPLIBRE_WORKER_URL } from "@/lib/maplibre-worker"
import { X } from "lucide-react"

export interface Coordinates {
  lat: number
  lng: number
}

interface MapPickerProps {
  value: Coordinates | null
  onChange: (coordinates: Coordinates) => void
  onAddressChange?: (address: string) => void
  center?: [number, number]
  onClose: () => void 
}

// ... qolgan kodlar (isRecord, getStreetAddress, va asosiy komponent) avvalgidek qoladi ...
// (Pastdagi kodni to'liq nusxalashingiz mumkin)

export default function MapPicker({ value, onChange, onAddressChange, center, onClose }: MapPickerProps) {
  const mapRef = useRef<MapRef>(null)
  const geocodeControllerRef = useRef<AbortController | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodingError, setGeocodingError] = useState("")

  useEffect(() => {
    if (center && !value) {
      mapRef.current?.flyTo({ center: [center[1], center[0]], zoom: 10 })
    }
  }, [center, value])

  useEffect(() => () => geocodeControllerRef.current?.abort(), [])

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      onChange({ lat: event.lngLat.lat, lng: event.lngLat.lng })
    },
    [onChange],
  )

  const handleMarkerDragEnd = useCallback(
    async (event: MarkerDragEvent) => {
      const coordinates = { lat: event.lngLat.lat, lng: event.lngLat.lng }
      onChange(coordinates)
      if (!onAddressChange) return

      geocodeControllerRef.current?.abort()
      const controller = new AbortController()
      geocodeControllerRef.current = controller
      setGeocodingError("")
      setGeocoding(true)

      try {
        const query = new URLSearchParams({
          format: "jsonv2",
          lat: String(coordinates.lat),
          lon: String(coordinates.lng),
        })
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?${query.toString()}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error(`Nominatim API status ${response.status}`)

        const data = await response.json()
        const address = data.address
        if (address) {
          const road = address.road || address.pedestrian || address.residential || address.street
          const houseNumber = address.house_number
          const fullAddress = [road, houseNumber].filter(Boolean).join(" ")
          if (fullAddress) onAddressChange(fullAddress)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setGeocodingError("Ko'cha manzilini aniqlab bo'lmadi")
        }
      } finally {
        if (!controller.signal.aborted) setGeocoding(false)
      }
    },
    [onAddressChange, onChange],
  )

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-gray-600 shadow-md transition hover:bg-white hover:text-red-600 dark:bg-zinc-800/90 dark:text-gray-300 dark:hover:text-red-400"
      >
        <X className="h-5 w-5" />
      </button>

      <Map
        ref={mapRef}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        workerUrl={MAPLIBRE_WORKER_URL}
        initialViewState={{
          longitude: center?.[1] ?? 69.2401,
          latitude: center?.[0] ?? 41.2995,
          zoom: value ? 14 : 6,
        }}
        onClick={handleMapClick}
        style={{ width: "100%", height: "18rem" }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {value && (
          <Marker
            longitude={value.lng}
            latitude={value.lat}
            draggable
            onDragEnd={handleMarkerDragEnd}
            anchor="bottom"
            color="#15803d"
          />
        )}
      </Map>
      
      <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1">
        {geocoding && <span className="rounded bg-white/90 px-2 py-1 text-xs text-gray-700 shadow-sm">Manzil aniqlanmoqda...</span>}
        {geocodingError && <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 shadow-sm">{geocodingError}</span>}
      </div>
    </div>
  )
}