"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Map, {
  Marker,
  type MapLayerMouseEvent,
  type MapRef,
  type MarkerDragEvent,
} from "react-map-gl/maplibre"
import { MAPLIBRE_WORKER_URL } from "@/lib/maplibre-worker"

export interface Coordinates {
  lat: number
  lng: number
}

interface MapPickerProps {
  value: Coordinates | null
  onChange: (coordinates: Coordinates) => void
  onAddressChange?: (address: string) => void
  center?: [number, number]
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

export default function MapPicker({ value, onChange, onAddressChange, center }: MapPickerProps) {
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
    <div className="overflow-hidden rounded-xl border border-gray-200">
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
        style={{ width: "100%", height: "16rem" }}
        aria-label="E'lon xaritasi"
      >
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
      <p className="bg-white px-3 py-2 text-xs text-gray-500">
        Xaritani bosing yoki belgini sudrab joylashuvni belgilang
        {value && ` · ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
        {geocoding && " · Ko'cha manzili aniqlanmoqda..."}
      </p>
      {geocodingError && (
        <p className="bg-white px-3 pb-2 text-xs text-amber-700" role="status">
          {geocodingError}
        </p>
      )}
    </div>
  )
}
