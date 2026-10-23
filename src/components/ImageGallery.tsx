"use client"

import { useState } from "react"
import { Home, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

export default function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0)
  const hasImages = images && images.length > 0

  if (!hasImages) {
    return (
      <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
        <Home className="h-20 w-20 text-green-300" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-100">
        <Image src={images[index]} alt={`${title} — rasm ${index + 1}`} fill sizes="100vw" className="object-cover transition-opacity duration-200" />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setIndex((index - 1 + images.length) % images.length)}
              aria-label="Oldingi rasm"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={() => setIndex((index + 1) % images.length)}
              aria-label="Keyingi rasm"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
            <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
              {index + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}-rasmni ko'rsatish`}
              aria-pressed={i === index}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 ${
                i === index ? "border-green-500 shadow-lg" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" fill sizes="(max-width: 640px) 25vw, 16vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
