"use client"

import { useEffect, useRef } from "react"
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet"

export interface Coordinates {
  lat: number
  lng: number
}

interface MapPickerProps {
  value: Coordinates | null
  onChange: (coordinates: Coordinates) => void
  center?: [number, number]
}

export default function MapPicker({ value, onChange, center }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const onChangeRef = useRef(onChange)
  const centerRef = useRef(center)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    centerRef.current = center
  }, [center])

  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null

    void import("leaflet").then(({ default: leaflet }) => {
      if (cancelled || !containerRef.current) return
      const initialCenter = centerRef.current
      map = leaflet
        .map(containerRef.current)
        .setView(initialCenter ?? [41.3111, 69.2797], initialCenter ? 10 : 6)
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map)
      map.on("click", (event: LeafletMouseEvent) => {
        onChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng })
      })
      mapRef.current = map
    })

    return () => {
      cancelled = true
      map?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void import("leaflet").then(({ default: leaflet }) => {
      if (cancelled) return
      const map = mapRef.current
      if (!map) return

      if (value) {
        if (markerRef.current) markerRef.current.setLatLng([value.lat, value.lng])
        else markerRef.current = leaflet.marker([value.lat, value.lng]).addTo(map)
        map.setView([value.lat, value.lng], Math.max(map.getZoom(), 14))
      } else if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    })
    return () => {
      cancelled = true
    }
  }, [value])

  useEffect(() => {
    if (center && !value) mapRef.current?.setView(center, 10)
  }, [center, value])

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div ref={containerRef} className="h-64 w-full" aria-label="E'lon xaritasi" />
      <p className="bg-white px-3 py-2 text-xs text-gray-500">
        Xaritani bosib e&apos;lon joylashuvini belgilang
        {value && ` · ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}
      </p>
    </div>
  )
}
