"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Send, Loader2, MessageSquare, Home } from "lucide-react"
import Navbar from "@/components/Navbar"

interface Conv {
  id: string
  listing: { id: string; title: string; images: string[]; price: number }
  buyer: { id: string; name: string | null; phone: string | null }
  seller: { id: string; name: string | null; phone: string | null }
  messages: { id: string; text: string; createdAt: string; sender: { id: string } }[]
  _count?: { messages: number }
}

interface Msg {
  id: string
  text: string
  createdAt: string
  sender: { id: string; name: string | null }
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })

export default function MessagesClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const sp = useSearchParams()
  const uid = session?.user?.id || ""

  const [convs, setConvs] = useState<Conv[]>([])
  const [selected, setSelected] = useState<string | null>(sp.get("c"))
  const [conv, setConv] = useState<Conv | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/messages")
  }, [status, router])

  // Conversationlar ro'yxati
  useEffect(() => {
    if (!session) return
    const load = () =>
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((d) => setConvs(d.conversations || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    load()
    const t = setInterval(load, 10000)
    return () => clearInterval(t)
  }, [session])

  // Tanlangan chat xabarlari
  useEffect(() => {
    if (!selected || !session) return
    const load = () =>
      fetch(`/api/conversations/${selected}/messages`)
        .then((r) => r.json())
        .then((d) => {
          setConv(d.conversation)
          setMessages(d.messages || [])
        })
        .catch(() => {})
    load()
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [selected, session])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${selected}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const d = await res.json()
      if (res.ok) {
        setMessages((m) => [...m, d.message])
        setText("")
      }
    } finally {
      setSending(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-green-500" />
      </div>
    )
  }
  if (!session) return null

  const other = (c: Conv) => (c.buyer.id === uid ? c.seller : c.buyer)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950">
      <Navbar />

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 lg:h-[calc(100vh-120px)]">
          {/* Ro'yxat */}
          <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col`}>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" /> Xabarlarim
            </h1>
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-500" /></div>
            ) : convs.length === 0 ? (
              <div className="text-center py-16 bg-white/80 dark:bg-zinc-900/80 rounded-2xl border border-white/70 dark:border-zinc-800">
                <MessageSquare className="h-10 w-10 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Hozircha xabarlar yo&apos;q</p>
                <Link href="/listings" className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-semibold rounded-xl">
                  <Home className="h-4 w-4" /> E'lonlarni ko'rish
                </Link>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto">
                {convs.map((c) => {
                  const o = other(c)
                  const last = c.messages[0]
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        selected === c.id
                          ? "bg-green-100 dark:bg-green-500/15 border-green-300 dark:border-green-500/40"
                          : "bg-white/80 dark:bg-zinc-900/80 border-white/70 dark:border-zinc-800 hover:border-green-300"
                      }`}
                    >
                      {c.listing.images?.[0] ? (
                        <Image src={c.listing.images[0]} alt="" width={48} height={48} sizes="48px" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0"><Home className="h-5 w-5 text-green-400" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-gray-800 dark:text-white truncate">{o.name || (o.phone || "Foydalanuvchi")}</span>
                          {last && <span className="text-[10px] text-gray-400 flex-shrink-0">{fmt(last.createdAt)}</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.listing.title}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {last ? (last.sender.id === uid ? "Siz: " : "") + last.text : "Xabar yo’q"}
                        </div>
                      </div>
                      {(c._count?.messages || 0) > 0 && (
                        <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                          {c._count?.messages || 0}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Chat oynasi */}
          <div className={`${selected ? "flex" : "hidden lg:flex"} flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/70 dark:border-zinc-800 rounded-2xl overflow-hidden`}>
            {!selected || !conv ? (
              <div className="flex-1 flex items-center justify-center p-10 text-center">
                <div>
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Suhbatni tanlang</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90">
                  <button onClick={() => setSelected(null)} className="lg:hidden p-2 text-gray-500" aria-label="Orqaga">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  {conv.listing.images?.[0] && (
                    <Image src={conv.listing.images[0]} alt="" width={40} height={40} sizes="40px" className="w-10 h-10 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-800 dark:text-white truncate">
                      {other(conv).name || other(conv).phone || "Foydalanuvchi"}
                    </div>
                    <Link href={`/listing/${conv.listing.id}`} className="text-xs text-green-600 dark:text-green-400 truncate block hover:underline">
                      {conv.listing.title} · ${conv.listing.price.toLocaleString("en-US")}
                    </Link>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[300px] lg:min-h-0">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender.id === uid ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm shadow-sm ${
                          m.sender.id === uid
                            ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-br-md"
                            : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-zinc-700 rounded-bl-md"
                        }`}
                      >
                        <p className="whitespace-pre-line">{m.text}</p>
                        <div className={`text-[10px] mt-1 ${m.sender.id === uid ? "text-green-100" : "text-gray-400"}`}>
                          {fmt(m.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90">
                  <div className="flex gap-2">
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Xabar yozing..."
                      className="flex-1 h-11 px-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-800 dark:text-white outline-none focus:border-green-400"
                    />
                    <button
                      onClick={send}
                      disabled={sending || !text.trim()}
                      className="w-11 h-11 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50"
                      aria-label="Yuborish"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
