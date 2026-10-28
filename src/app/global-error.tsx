"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"
import { AlertTriangle, RefreshCcw, Home } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Xatoni Sentry'ga yuborish
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="uz">
      <body className="antialiased">
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 flex items-center justify-center px-4 sm:px-6">
          <div className="max-w-md w-full text-center space-y-6">
            
            {/* Xato ikonkasi */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center animate-in zoom-in duration-300">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
            </div>
            
            {/* Sarlavha va Tavsif */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Kechirasiz, xatolik yuz berdi
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Tizimda kutilmagan muammo yuzaga keldi. Iltimos, sahifani yangilab qayta urinib ko&apos;ring.
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 dark:text-gray-600 font-mono bg-gray-100 dark:bg-zinc-900 py-1 px-2 rounded inline-block">
                  Xato ID: {error.digest}
                </p>
              )}
            </div>

            {/* Tugmalar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <RefreshCcw className="h-4 w-4" /> Qayta urinish
              </button>
              
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/90 hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                <Home className="h-4 w-4" /> Bosh sahifa
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}