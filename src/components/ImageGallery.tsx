"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

export default function ImageGallery({ images }: { images: string[] }) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null)

  if (!images || images.length === 0) {
    return <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 text-sm">Rasmlar mavjud emas</div>
  }

  return (
    <>
      <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`}>
        {images.map((img, i) => (
          <div
            key={i}
            className={`relative rounded-xl overflow-hidden cursor-pointer group bg-gray-100 border border-gray-100 ${
              images.length === 1 ? 'aspect-video' : 'aspect-square'
            }`}
            onClick={() => setSelectedImg(img)}
          >
            <Image 
              src={img} 
              alt={`Rasm ${i + 1}`} 
              fill 
              className="object-cover transition-transform duration-300 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-medium transition-opacity">
                Kattalashtirish
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal (To'liq ekran) */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImg(null)}
        >
          <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-6xl h-[85vh]">
            <Image 
              src={selectedImg} 
              alt="To'liq ekran rasm" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      )}
    </>
  )
}
