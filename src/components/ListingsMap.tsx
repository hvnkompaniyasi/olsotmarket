"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Map, { Marker, Popup, type MapRef } from "react-map-gl/maplibre"
import { MAPLIBRE_WORKER_URL } from "@/lib/maplibre-worker"

export interface MapListing {
  id: string
  title: string
  price: string
  lat: number
  lng: number
  image: string
  isPremium: boolean
}

export default function ListingsMap({ listings }: { listings: MapListing[] }) {
  const mapRef = useRef<MapRef>(null)
  const [loaded, setLoaded] = useState(false)
  const [selected, setSelected] = useState<MapListing | null>(null)

  useEffect(() => {
    if (!loaded || listings.length === 0) return
    const longitudes = listings.map((listing) => listing.lng)
    const latitudes = listings.map((listing) => listing.lat)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ]
    mapRef.current?.fitBounds(bounds, { padding: 40, maxZoom: 14 })
  }, [listings, loaded])

  return (
    <div className="pointer-events-auto h-[500px] w-full overflow-hidden rounded-3xl shadow-[0_8px_30px_rgba(10,124,78,0.12)] sm:h-[65vh]">
      <Map
        ref={mapRef}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        workerUrl={MAPLIBRE_WORKER_URL}
        initialViewState={{ longitude: 69.24, latitude: 41.31, zoom: 6 }}
        onLoad={() => setLoaded(true)}
        onError={(event) => console.error("MapLibre listings map error:", event.error)}
        interactive
        dragPan
        scrollZoom
        doubleClickZoom
        touchZoomRotate
        style={{ width: "100%", height: "100%" }}
      >
      {listings.map((listing) => (
        <Marker key={listing.id} longitude={listing.lng} latitude={listing.lat} anchor="bottom">
          <button
            type="button"
            className={`price-pin${listing.isPremium ? " price-pin-vip" : ""}`}
            onClick={() => setSelected(listing)}
            aria-label={`${listing.price}, ${listing.title}`}
          >
            {listing.price}
          </button>
        </Marker>
      ))}
      {selected && (
        <Popup
          longitude={selected.lng}
          latitude={selected.lat}
          anchor="bottom"
          onClose={() => setSelected(null)}
          closeOnClick={false}
        >
          <div className="min-w-[180px]">
            {selected.image && (
              <div className="relative mb-2 h-[100px] w-full overflow-hidden rounded-[10px]">
                <Image
                  src={selected.image}
                  alt={`${selected.title} — e'lon rasmi`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            )}
            <p className="my-1 text-[13px] font-extrabold">{selected.title}</p>
            <Link
              href={`/listing/${encodeURIComponent(selected.id)}`}
              className="text-xs font-bold text-[#0A7C4E]"
            >
              E&apos;lonni ko&apos;rish →
            </Link>
          </div>
        </Popup>
      )}
      </Map>
    </div>
  )
}
