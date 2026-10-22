import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { authOptions } from "@/lib/auth-options"
import { isSupabaseConfigured } from "@/lib/supabaseClient"
import Navbar from "@/components/Navbar"
import MobileNav from "@/components/MobileNav"
import CreateListingForm from "@/components/listings/create/CreateListingForm"

export const metadata: Metadata = {
  title: "E'lon qo'shish | Olsot Market",
  description: "Ko'chmas mulk e'lonini joylashtiring",
}

export const dynamic = "force-dynamic"

export default async function CreateListingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login?callbackUrl=/listings/create")

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-10">
      <Navbar />

      <main className="max-w-2xl mx-auto px-3 sm:px-6 py-4">
        <Link
          href="/my-listings"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-[#0A7C4E] mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> E'lonlarim
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-[#0A7C4E]" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">Yangi e'lon</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              Ma'lumotlarni to'ldiring va rasmlarni yuklang
            </p>
          </div>
        </div>

        <CreateListingForm storageReady={isSupabaseConfigured()} />
      </main>

      <MobileNav />
    </div>
  )
}
