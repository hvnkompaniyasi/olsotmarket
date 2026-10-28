"use client"

import { useEffect } from "react"
import Link from "next/link"
import * as Sentry from "@sentry/nextjs" // Sentry qo'shildi
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Xatoni Sentry'ga yuboramiz (Monitoring uchun)
    Sentry.captureException(error)
    console.error("Profil sahifasida xatolik:", error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div 
        role="alert" // Skrinrider uchun qulaylik
        className="max-w-md w-full text-center bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-300"
      >
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
          Nimadir noto&apos;g&apos;ri ketdi
        </h1>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          Profil ma&apos;lumotlarini yuklashda muammo yuzaga keldi. Iltimos, qayta urinib ko&apos;ring yoki bosh sahifaga qayting.
        </p>
        
        {/* Mobil uchun flex-col, kompyuter uchun flex-row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={reset}
            className="flex-1 h-12 bg-[#0A7C4E] hover:bg-[#086339] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RefreshCw className="h-4 w-4" /> Qayta urinish
          </button>
          
          <Link
            href="/"
            className="flex-1 h-12 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-gray-200 dark:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
        </div>
        
        {error.digest && (
          <div className="mt-6 border-t border-gray-100 dark:border-zinc-800 pt-4">
            <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800/50 py-1.5 px-3 rounded-md inline-block">
              Xato ID: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}