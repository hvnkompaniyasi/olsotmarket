"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { MessageSquare } from "lucide-react"

export default function ChatNavLink() {
  const { data: session } = useSession()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!session) return
    const load = () =>
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((d) => setUnread(d.unreadTotal || 0))
        .catch(() => {})
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [session])

  if (!session) {
    return (
      <Link
        href="/login?callbackUrl=/messages"
        aria-label="Xabarlar"
        className="flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
      >
        <MessageSquare className="h-5 w-5" />
      </Link>
    )
  }

  return (
    <Link
      href="/messages"
      aria-label="Xabarlar"
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
    >
      <MessageSquare className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  )
}
