import { Suspense } from "react"
import MessagesClient from "@/components/MessagesClient"
export const metadata = {
  title: "Xabarlar | Olsot Market",
  description: "Xabar almashish",
  openGraph: { images: ["/logo.svg"] },
}

export const dynamic = "force-dynamic"

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-zinc-950">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    }>
      <MessagesClient />
    </Suspense>
  )
}
