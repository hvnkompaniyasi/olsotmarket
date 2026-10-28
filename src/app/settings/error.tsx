"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Xatoni konsolga yozamiz (Yoki Sentry'ga yuborish mumkin)
    console.error("Sozlamalar sahifasida xatolik:", error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-zinc-800 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        
        {/* Xato ikonkasi */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        
        {/* Matnlar */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Kechirasiz, xatolik yuz berdi
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Sozlamalarni yuklashda muammo yuzaga keldi. Iltimos, qayta urinib ko&apos;ring yoki keyinroq qayta kiring.
          </p>
        </div>

        {/* Tugmalar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0A7C4E] hover:bg-[#086339] text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RefreshCcw className="h-4 w-4" /> Qayta urinish
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
        </div>
      </div>
    </div>
  )
}