"use client"

import { useState } from "react"
import Image from "next/image"
import imageCompression from "browser-image-compression"
import { UploadCloud, X, Loader2 } from "lucide-react"

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  maxFiles?: number
}

export default function ListingImageUploader({ images, onChange, maxFiles = 10 }: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError("")
    setUploading(true)

    try {
      const newImages = [...images]
      const filesArray = Array.from(files)

      for (const file of filesArray) {
        if (newImages.length >= maxFiles) {
          setError(`Maksimal ${maxFiles} ta rasm yuklashingiz mumkin.`)
          break
        }

        const options = { maxSizeMB: 0.3, maxWidthOrHeight: 1920, useWebWorker: true }
        
        let fileToUpload = file
        try {
          fileToUpload = await imageCompression(file, options)
        } catch (compressErr) {
          console.warn("Rasmni siqishda xatolik, asl fayl yuklanadi:", compressErr)
        }

        const formData = new FormData()
        formData.append("file", fileToUpload)

        const res = await fetch("/api/uploadthing", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Rasm yuklashda xatolik yuz berdi")
        
        const data = await res.json()
        if (data.url) newImages.push(data.url)
      }

      onChange(newImages)
    } catch (err) {
      console.error(err)
      setError("Rasmlarni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
            <Image src={img} alt={`Rasm ${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {images.length < maxFiles && (
          <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${uploading ? 'bg-gray-50 border-gray-300' : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100'}`}>
            {uploading ? (
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            ) : (
              <>
                <UploadCloud className="w-6 h-6 text-emerald-500 mb-1" />
                <span className="text-[10px] text-emerald-700 font-medium text-center">Rasm qo'shish</span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg, image/png, image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        JPG, PNG yoki WEBP formatidagi rasmlar. Maksimal {maxFiles} ta. (Rasmlar avtomatik siqiladi).
      </p>
    </div>
  )
}
