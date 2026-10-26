"use client"

import Map, { Marker } from "react-map-gl/maplibre"
import { MapPin } from "lucide-react"
import Link from "next/link"
import { MAPLIBRE_WORKER_URL } from "@/lib/maplibre-worker"

interface ListingLocationMapProps {
  latitude: number
  longitude: number
  district: string
}

export default function ListingLocationMap({
  latitude,
  longitude,
  district,
}: ListingLocationMapProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-gray-900">Joylashuvi xaritada</h2>
        <span className="truncate text-[11px] font-medium text-gray-500">{district}</span>
      </div>
      <div className="relative h-40 overflow-hidden rounded-xl border border-gray-200">
        <Map
          mapStyle="https://tiles.openfreemap.org/styles/liberty"
          workerUrl={MAPLIBRE_WORKER_URL}
          initialViewState={{ longitude, latitude, zoom: 14 }}
          dragPan={false}
          scrollZoom={false}
          doubleClickZoom={false}
          touchZoomRotate={false}
          attributionControl={false}
          style={{ width: "100%", height: "100%" }}
        >
          <Marker longitude={longitude} latitude={latitude} anchor="bottom">
            <span className="grid h-10 w-10 place-items-center rounded-full border-[3px] border-white bg-emerald-700 text-white shadow-lg">
              <MapPin className="h-5 w-5" fill="currentColor" />
            </span>
          </Marker>
        </Map>
        <Link
          href={`https://maps.google.com/?q=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-[11px] font-semibold text-emerald-800 shadow-sm"
        >
          Xaritada ochish →
        </Link>
      </div>
    </section>
  )
}
