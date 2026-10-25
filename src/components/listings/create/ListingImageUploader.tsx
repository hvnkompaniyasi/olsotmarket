"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Loader2, Pencil, UploadCloud, X } from "lucide-react"
import {
  deleteListingImage,
  listingImagePathFromUrl,
  uploadListingImage,
} from "@/lib/supabaseClient"
import { MAX_LISTING_IMAGES, MAX_LISTING_IMAGE_SIZE } from "@/lib/listing-form"

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
const MAX_SOURCE_IMAGE_SIZE = 20 * 1024 * 1024

interface Props {
  images: string[]
  onChange: (images: string[]) => void
  onBusyChange: (busy: boolean) => void
  onError?: (error: string) => void
  draftId: string
  disabled?: boolean
}

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext("2d")
  if (!context) throw new Error("Rasmni qayta ishlash imkoni bo'lmadi")
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  let quality = 0.86
  let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality))
  while (blob && blob.size > MAX_LISTING_IMAGE_SIZE && quality > 0.4) {
    quality -= 0.12
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality))
  }

  if (!blob || blob.size > MAX_LISTING_IMAGE_SIZE) {
    throw new Error("Siqilgandan keyin ham rasm 5 MB dan katta")
  }

  const name = `${file.name.replace(/\.[^.]+$/, "")}.webp`
  return new File([blob], name, { type: "image/webp", lastModified: Date.now() })
}

export default function ListingImageUploader({
  images,
  onChange,
  onBusyChange,
  onError,
  draftId,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState("")
  const [uploadProgress, setUploadProgress] = useState<{ name: string; value: number } | null>(null)
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null)

  const setUploading = (value: boolean) => {
    setBusy(value)
    onBusyChange(value)
  }

  const handleFiles = async (list: FileList | File[], replacementIndex: number | null = null) => {
    const selectedFiles = Array.from(list)
    const files = replacementIndex === null ? selectedFiles : selectedFiles.slice(0, 1)
    if (files.length === 0 || disabled) return

    if (files.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      setError("Faqat JPG, PNG yoki WEBP rasmlar yuklanadi")
      return
    }
    if (files.some((file) => file.size > MAX_SOURCE_IMAGE_SIZE)) {
      setError("Har bir rasm 20 MB dan kichik bo'lishi kerak")
      return
    }
    if (replacementIndex === null && images.length + files.length > MAX_LISTING_IMAGES) {
      setError(`Maksimum ${MAX_LISTING_IMAGES} ta rasm yuklash mumkin`)
      return
    }

    setError("")
    onError?.("")
    setUploading(true)
    const next = [...images]

    try {
      for (const original of files) {
        const file = await compressImage(original)
        setUploadProgress({ name: original.name, value: 0 })
        const imageUrl = await uploadListingImage(file, draftId, (value) => {
          setUploadProgress({ name: original.name, value })
        })
        if (replacementIndex === null) {
          next.push(imageUrl)
        } else {
          const oldUrl = next[replacementIndex]
          next[replacementIndex] = imageUrl
          onChange([...next])
          const oldPath = oldUrl ? listingImagePathFromUrl(oldUrl) : null
          if (oldPath) {
            try {
              await deleteListingImage(oldPath)
            } catch (deleteError) {
              const message =
                deleteError instanceof Error ? deleteError.message : "Eski rasm o'chirilmadi"
              setError(message)
              onError?.(message)
            }
          }
          continue
        }
        onChange([...next])
      }
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Rasm yuklanmadi"
      setError(message)
      onError?.(message)
    } finally {
      setUploadProgress(null)
      setUploading(false)
    }
  }

  const removeImage = async (url: string) => {
    onChange(images.filter((item) => item !== url))
    const path = listingImagePathFromUrl(url)
    if (!path) return
    try {
      await deleteListingImage(path)
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Rasm o'chirilmadi"
      setError(message)
      onError?.(message)
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
          if (event.key === "Enter" || event.key === " ") {
            setReplaceIndex(null)
            inputRef.current?.click()
          }
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
          if (!disabled && !busy) {
            setReplaceIndex(null)
            inputRef.current?.click()
          }
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
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files, replaceIndex)
            setReplaceIndex(null)
            event.target.value = ""
          }}
        />
        {busy ? (
          <div className="w-full max-w-xs mx-auto">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A7C4E] mx-auto mb-2" />
            <p className="text-[11px] text-gray-500">{uploadProgress?.name} · {uploadProgress?.value ?? 0}%</p>
            <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-green-700 transition-all"
                style={{ width: `${uploadProgress?.value ?? 0}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <UploadCloud className="h-8 w-8 text-gray-300 dark:text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              Rasmlarni shu yerga tashlang
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              yoki bosib tanlang · JPG, PNG, WEBP · har biri 5 MB gacha siqiladi
            </p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600" role="alert">{error}</p>}

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
                onClick={() => {
                  setReplaceIndex(index)
                  inputRef.current?.click()
                }}
                aria-label={`${index + 1}-rasmni almashtirish`}
                className="absolute bottom-1 left-1 rounded-full bg-black/60 p-1 text-white hover:bg-green-700"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
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
