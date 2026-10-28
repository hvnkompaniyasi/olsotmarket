import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import { ArrowLeft, UserRound, Loader2 } from "lucide-react"
import { authOptions } from "@/lib/auth-options"
import { isSupabaseConfigured } from "@/lib/supabaseClient"
import Logo from "@/components/ui/Logo"

// Formani dinamik yuklash (Sayt tezligini oshiradi)
const CreateListingForm = dynamic(
  () => import("@/components/listings/create/CreateListingForm"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-green-700 dark:text-green-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Forma yuklanmoqda...</p>
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: "E'lon qo'shish | Olsot Market",
  description: "Ko'chmas mulk e'lonini joylashtiring",
}

export const dynamic = "force-dynamic"

export default async function CreateListingPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login?callbackUrl=/listings/create")
  
  const userInitial = session.user.name?.trim().charAt(0).toLocaleUpperCase("uz-UZ")

  return (
    <div className="min-h-screen bg-[#F6F7FB] pb-28 dark:bg-zinc-950 lg:pb-10">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
          <Link
            href="/my-listings"
            aria-label="E'lonlarim sahifasiga qaytish"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/" aria-label="Olsot Market bosh sahifasi">
            <Logo size="sm" />
          </Link>
          <Link
            href="/profile"
            aria-label="Profilga o'tish"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-800 dark:bg-green-500/10 dark:text-green-300"
          >
            {userInitial || <UserRound className="h-5 w-5" />}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-5">
        <div className="mb-4">
          <h1 className="text-xl font-extrabold text-gray-950 dark:text-white">Yangi e&apos;lon</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            E&apos;loningiz haqida asosiy ma&apos;lumotlarni kiriting
          </p>
        </div>
        
        {/* Dinamik yuklangan forma */}
        <CreateListingForm storageReady={isSupabaseConfigured()} />
      </main>
    </div>
  )
}