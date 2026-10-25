"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Route error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-1.5">
          Nimadir noto'g'ri ketdi
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
          Xato haqida xabar berdik. Iltimos, qayta urinib ko'ring.
        </p>
        <div className="flex gap-2">
          <button
            onClick={reset}
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" /> Qayta urinish
          </button>
          <Link
            href="/"
            className="flex-1 h-11 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
        </div>
        {error.digest && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3">Kod: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
