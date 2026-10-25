"use client"

import { useEffect, useRef, useState } from "react"
import type { LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet"

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export default function MapPicker({ value, onChange, onAddressChange, center }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const onChangeRef = useRef(onChange)
  const onAddressChangeRef = useRef(onAddressChange)
  const centerRef = useRef(center)
  const geocodeControllerRef = useRef<AbortController | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodingError, setGeocodingError] = useState("")

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange
  }, [onAddressChange])

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
      map.whenReady(() => map?.invalidateSize())
      window.setTimeout(() => map?.invalidateSize(), 100)
    })

    return () => {
      cancelled = true
      geocodeControllerRef.current?.abort()
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
        if (markerRef.current) {
          markerRef.current.setLatLng([value.lat, value.lng])
        } else {
          markerRef.current = leaflet
            .marker([value.lat, value.lng], { draggable: true })
            .addTo(map)
          markerRef.current.on("dragend", async () => {
            const position = markerRef.current?.getLatLng()
            if (!position) return
            const coordinates = { lat: position.lat, lng: position.lng }
            onChangeRef.current(coordinates)
            if (!onAddressChangeRef.current) return

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
              const result: unknown = await response.json()
              if (!isRecord(result) || !isRecord(result.address)) {
                throw new Error("Nominatim returned no address data")
              }
              const address = result.address
              const road =
                address.road ??
                address.pedestrian ??
                address.residential ??
                address.path ??
                address.street
              if (typeof road === "string" && road.trim()) {
                const houseNumber =
                  typeof address.house_number === "string" ? address.house_number.trim() : ""
                onAddressChangeRef.current(
                  [road.trim(), houseNumber].filter(Boolean).join(" "),
                )
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
          })
        }
        if (map.getZoom() < 10) map.setView([value.lat, value.lng], 14)
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
