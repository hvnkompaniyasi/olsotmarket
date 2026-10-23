"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, UploadCloud, X } from "lucide-react"
import {
  deleteListingImage,
  listingImagePathFromUrl,
  uploadListingImage,
} from "@/lib/supabaseClient"
import { MAX_LISTING_IMAGES, MAX_LISTING_IMAGE_SIZE } from "@/lib/listing-form"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  onBusyChange: (busy: boolean) => void
  draftId: string
  disabled?: boolean
}

export default function ListingImageUploader({
  images,
  onChange,
  onBusyChange,
  draftId,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState("")

  const setUploading = (value: boolean) => {
    setBusy(value)
    onBusyChange(value)
  }

  const handleFiles = async (list: FileList | File[]) => {
    const files = Array.from(list)
    if (files.length === 0 || disabled) return

    if (files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number]))) {
      setError("Faqat JPG, PNG yoki WEBP rasmlar yuklanadi")
      return
    }
    if (files.some((file) => file.size > MAX_LISTING_IMAGE_SIZE)) {
      setError("Har bir rasm 5 MB dan kichik bo'lishi kerak")
      return
    }
    if (images.length + files.length > MAX_LISTING_IMAGES) {
      setError(`Maksimum ${MAX_LISTING_IMAGES} ta rasm yuklash mumkin`)
      return
    }

    setError("")
    setUploading(true)
    const next = [...images]

    for (const file of files) {
      try {
        next.push(await uploadListingImage(file, draftId))
        onChange([...next])
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Rasm yuklanmadi")
      }
    }

    setUploading(false)
  }

  const removeImage = async (url: string) => {
    onChange(images.filter((item) => item !== url))
    const path = listingImagePathFromUrl(url)
    if (!path) return
    try {
      await deleteListingImage(path)
    } catch {
      // Storage'dagi fayl qolib ketishi mumkin; e'lon baribir saqlanadi.
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
      {images.map((url) => (
        <input key={url} type="hidden" name="images" value={url} />
      ))}

      <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 block">
        Rasmlar * (maks. {MAX_LISTING_IMAGES})
      </label>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click()
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          void handleFiles(event.dataTransfer.files)
        }}
        onClick={() => {
          if (!disabled && !busy) inputRef.current?.click()
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          disabled
            ? "border-gray-200 dark:border-zinc-800 opacity-60 cursor-not-allowed"
            : dragOver
              ? "border-[#0A7C4E] bg-green-50 dark:bg-green-500/10 cursor-pointer"
              : "border-gray-200 dark:border-zinc-700 hover:border-[#0A7C4E]/60 cursor-pointer"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          disabled={disabled || busy}
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files)
            event.target.value = ""
          }}
        />
        {busy ? (
          <div className="w-full max-w-xs mx-auto">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A7C4E] mx-auto mb-2" />
            <p className="text-[11px] text-gray-400">Yuklanmoqda...</p>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Rasmlarni shu yerga tashlang
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">yoki bosib tanlang · JPG, PNG, WEBP</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700"
            >
              <div className="relative w-full h-20">
                <Image src={url} alt={`Rasm ${index + 1}`} fill sizes="120px" className="object-cover" />
              </div>
              {index === 0 && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#0A7C4E] text-white text-[9px] font-bold rounded">
                  Asosiy
                </span>
              )}
              <button
                type="button"
                onClick={() => void removeImage(url)}
                aria-label={`${index + 1}-rasmni o'chirish`}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
