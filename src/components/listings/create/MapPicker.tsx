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
import "maplibre-gl/dist/maplibre-gl.css" // Xarita ko'rinishi uchun eng muhim qator!
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
  onClose: () => void // Xaritani yopish uchun
}

interface NominatimAddress {
  road?: unknown
  pedestrian?: unknown
  residential?: unknown
  path?: unknown
  street?: unknown
  house_number?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getStreetAddress(value: unknown): string | null {
  if (!isRecord(value) || !isRecord(value.address)) return null

  const address = value.address as NominatimAddress
  const road = [address.road, address.pedestrian, address.residential, address.path, address.street]
    .find((candidate): candidate is string => typeof candidate === "string" && Boolean(candidate.trim()))
  if (!road) return null

  const houseNumber = typeof address.house_number === "string" ? address.house_number.trim() : ""
  return [road.trim(), houseNumber].filter(Boolean).join(" ")
}

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

        const address = getStreetAddress(await response.json())
        if (address) {
          onAddressChange(address)
        } else {
          setGeocodingError("Bu joy uchun ko'cha manzili topilmadi")
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
      {/* Xaritani yopish tugmasi */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 text-gray-600 shadow-md transition hover:bg-white hover:text-red-600 dark:bg-zinc-800/90 dark:text-gray-300 dark:hover:text-red-400"
        title="Xaritani yopish"
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
        aria-label="E'lon xaritasi"
      >
        {/* Zoom +/- va Geolocation tugmalari */}
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
      
      {/* Ortiqcha yozuvlar o'rniga faqat holat xabari */}
      <div className="absolute bottom-2 left-2 z-10 flex flex-col gap-1">
        {geocoding && (
          <span className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
            Manzil aniqlanmoqda...
          </span>
        )}
        {geocodingError && (
          <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 shadow-sm">
            {geocodingError}
          </span>
        )}
      </div>
    </div>
  )
}