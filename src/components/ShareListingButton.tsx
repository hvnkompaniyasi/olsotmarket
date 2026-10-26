"use client"

import { useState } from "react"
import {
  Share2, Check, X, Send, MessageCircle, Mail, Smartphone, Link2,
} from "lucide-react"

// Facebook brand ikonka (lucide'da yo'q - inline SVG)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

interface ShareListingButtonProps {
  title: string
  className?: string
  compact?: boolean
}

export default function ShareListingButton({ title, className, compact = false }: ShareListingButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const link = typeof window !== "undefined" ? window.location.href : ""
  const encUrl = encodeURIComponent(link)
  const encTitle = encodeURIComponent(title)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // jim
    }
  }

  const tryNativeShare = async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.share) return false
    try {
      await navigator.share({ title, url: link })
      return true
    } catch (err) {
      if ((err as Error).name === "AbortError") return true
      return false
    }
  }

  const onClick = async () => {
    const handled = await tryNativeShare()
    if (!handled) setOpen(true)
  }

  const TARGETS = [
    { name: "Telegram", icon: Send, href: `https://t.me/share/url?url=${encUrl}&text=${encTitle}`, color: "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400" },
    { name: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encTitle}%20${encUrl}`, color: "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" },
    { name: "Facebook", icon: FacebookIcon, href: `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { name: "Email", icon: Mail, href: `mailto:?subject=${encTitle}&body=${encUrl}`, color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { name: "SMS", icon: Smartphone, href: `sms:?body=${encTitle}%20${encUrl}`, color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  ]

  return (
    <>
      <button
        onClick={onClick}
        aria-label="Ulashish"
        className={`${compact ? "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 p-0 shadow-md backdrop-blur-md" : "flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 font-semibold text-sm text-gray-700 hover:border-[#0A7C4E] dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200"} transition-colors ${className ?? ""}`}
      >
        <Share2 className="h-4 w-4" />
        {compact ? <span className="sr-only">Ulashish</span> : "Ulashish"}
      </button>

      {open && (
        <div className="fixed inset-0 z-[850] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-zinc-900 rounded-t-3xl p-5 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Ulashish</h3>
              <button onClick={() => setOpen(false)} aria-label="Yopish">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {TARGETS.map((t) => {
                const Icon = t.icon
                return (
                  <a
                    key={t.name}
                    href={t.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.color}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{t.name}</span>
                  </a>
                )
              })}
            </div>

            <button
              onClick={copy}
              className="mt-4 h-12 w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Havola nusxalandi" : "Havolani nusxalash"}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
