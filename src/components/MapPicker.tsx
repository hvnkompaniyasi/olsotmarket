"use client"

import { useEffect, useRef } from "react"
import Map, { Marker, type MapLayerMouseEvent, type MapRef } from "react-map-gl/maplibre"
import { MAPLIBRE_WORKER_URL } from "@/lib/maplibre-worker"

interface MapPickerProps {
  value: { lat: number; lng: number } | null
  onChange: (coords: { lat: number; lng: number } | null) => void
  center?: [number, number]
}

export default function MapPicker({ value, onChange, center }: MapPickerProps) {
  const mapRef = useRef<MapRef>(null)

  useEffect(() => {
    if (center && !value) {
      mapRef.current?.flyTo({ center: [center[1], center[0]], zoom: 10 })
    }
  }, [center, value])

  const handleMapClick = (event: MapLayerMouseEvent) => {
    onChange({ lat: event.lngLat.lat, lng: event.lngLat.lng })
  }

  return (
    <div className="relative h-64 overflow-hidden rounded-2xl border-2 border-white/70 shadow-lg sm:h-80">
      <Map
        ref={mapRef}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        workerUrl={MAPLIBRE_WORKER_URL}
        initialViewState={{
          longitude: value?.lng ?? center?.[1] ?? 69.2401,
          latitude: value?.lat ?? center?.[0] ?? 41.2995,
          zoom: value ? 14 : 6,
        }}
        onClick={handleMapClick}
        style={{ width: "100%", height: "100%" }}
      >
        {value && (
          <Marker longitude={value.lng} latitude={value.lat} anchor="bottom" color="#0a7c4e" />
        )}
      </Map>
      <div className="pointer-events-none absolute left-2 top-2 z-10">
        <div className="inline-block rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-gray-700 shadow-md">
          📍 Xaritaga bosib aniq joylashuvni belgilang
        </div>
      </div>
    </div>
  )
}
