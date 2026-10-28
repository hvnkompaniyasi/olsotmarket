"use client"

import Link from "next/link"
import { WifiOff, Home, RefreshCw } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Ikonka (Pulse animatsiyasi bilan) */}
        <div className="relative mx-auto w-24 h-24 mb-2 rounded-full bg-white dark:bg-zinc-900 shadow-xl shadow-green-500/10 dark:shadow-none flex items-center justify-center border border-gray-100 dark:border-zinc-800 animate-pulse">
          <WifiOff className="h-10 w-10 text-[#0A7C4E] dark:text-emerald-500" />
          {/* Kichik qizil nuqta (xato holatini bildiradi) */}
          <span className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </div>

        {/* Matnlar */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Internet aloqasi yo&apos;q
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            Iltimos, Wi-Fi yoki mobil internet ulanishingizni tekshirib, qayta urinib ko&apos;ring.
          </p>
        </div>

        {/* Tugmalar (Mobil uchun ustma-ust, kompyuter uchun yonma-yon) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0A7C4E] to-[#08623D] hover:from-[#086339] hover:to-[#064D2F] text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            <RefreshCw className="h-4 w-4" /> Qayta urinish
          </button>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
        </div>

      </div>
    </div>
  )
}