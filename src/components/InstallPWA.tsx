"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { usePathname } from "next/navigation"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function InstallPWA() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const pathname = usePathname()

  // Admin sahifalarida bu oynani ko'rsatmaymiz
  if (pathname.startsWith("/admin")) {
    return null
  }

  useEffect(() => {
    // Avval o'rnatilgan bo'lsa ko'rsatma
    if (typeof window === "undefined") return
    if (window.matchMedia("(display-mode: standalone)").matches) return
    if (localStorage.getItem("pwa-dismissed")) {
      setDismissed(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  if (!prompt || dismissed) return null

  const install = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") {
      setPrompt(null)
    }
  }

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem("pwa-dismissed", "1") } catch {}
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 animate-fade-in-up">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-green-200 dark:border-green-500/30 p-4 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
            <path d="M12 3 L4 10 L6 10 L6 21 L10 21 L10 16 L14 16 L14 21 L18 21 L18 10 L20 10 Z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-gray-800 dark:text-white">Olsot Market ilovasini o'rnating</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Home screen'ga qo'shing — tezkor kirish
          </div>
        </div>
        <button onClick={dismiss} className="p-1 text-gray-400 hover:text-gray-600" aria-label="Yopish">
          <X className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={install}
        className="mt-2 w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-400/30 flex items-center justify-center gap-2 text-sm"
      >
        <Download className="h-4 w-4" /> Qurilmaga o'rnatish
      </button>
    </div>
  )
}