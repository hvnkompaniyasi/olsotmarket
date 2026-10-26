"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton({ className }: { className?: string }) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      aria-label="Orqaga qaytish"
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md backdrop-blur-md transition-colors hover:bg-white ${className ?? ""}`}
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  )
}
