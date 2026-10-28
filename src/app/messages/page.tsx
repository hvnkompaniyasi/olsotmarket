import { Suspense } from "react"
import type { Metadata } from "next"
import MessagesClient from "@/components/MessagesClient"

export const metadata: Metadata = {
  title: "Xabarlar | Olsot Market",
  description: "Sotuvchilar va xaridorlar o'rtasidagi yozishmalar.",
  robots: {
    index: false, // Qidiruv tizimlarida chiqmasligi kerak (shaxsiy sahifa)
    follow: false,
  },
  openGraph: {
    title: "Xabarlar | Olsot Market",
    description: "Sotuvchilar va xaridorlar o'rtasidagi yozishmalar.",
    images: ["/logo.svg"],
  },
}

export const dynamic = "force-dynamic"

// CHAT UCHUN SKELETON (Sayt qotib qolmagandek taassurot qoldiradi)
function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex h-[80vh] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Chap panel (Suhbatlar ro'yxati) */}
          <div className="hidden w-1/3 flex-col border-r border-gray-100 p-4 dark:border-zinc-800 md:flex">
            <div className="mb-4 h-10 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-zinc-800" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="mb-3 flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
                  <div className="h-2 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
          
          {/* O'ng panel (Xabarlar oynasi) */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 dark:border-zinc-800">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100 dark:bg-zinc-800" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100 dark:bg-zinc-800" />
            </div>
            <div className="flex-1 space-y-4 py-6">
              <div className="h-10 w-2/3 animate-pulse rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-zinc-800" />
              <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl rounded-tr-sm bg-emerald-50 dark:bg-emerald-900/20" />
              <div className="h-12 w-3/4 animate-pulse rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-zinc-800" />
            </div>
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <MessagesClient />
    </Suspense>
  )
}