import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Plus, FileText, Heart, MessageSquare, KeyRound, Settings,
  ChevronRight, LogOut as LogOutIcon,
} from "lucide-react"
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"
import Navbar from "@/components/Navbar"
import MobileNav from "@/components/MobileNav"
import Footer from "@/components/Footer"
import LogoutItem from "@/components/LogoutItem"
import ProfileEditSheet from "@/components/ProfileEditSheet"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Profil | Olsot Market",
}

const MENU = [
  { href: "/listings/create", icon: Plus, label: "Yangi e'lon qo'shish", color: "bg-green-50 dark:bg-green-500/10 text-[#0A7C4E]" },
  { href: "/my-listings", icon: FileText, label: "Mening e'lonlarim", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-500" },
  { href: "/favorites", icon: Heart, label: "Sevimli e'lonlar", color: "bg-red-50 dark:bg-red-500/10 text-red-500" },
  { href: "/messages", icon: MessageSquare, label: "Xabarlarim", color: "bg-green-50 dark:bg-green-500/10 text-green-500" },
  { href: "/settings", icon: KeyRound, label: "Parolni o'zgartirish", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" },
  { href: "/settings", icon: Settings, label: "Qo'shimcha sozlamalar", color: "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-300" },
]

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login?callbackUrl=/profile")

  const uid = session.user.id
  const [total, active, favs] = await Promise.all([
    prisma.listing.count({ where: { userId: uid } }),
    prisma.listing.count({ where: { userId: uid, status: "ACTIVE" } }),
    prisma.favorite.count({ where: { userId: uid } }),
  ])

  const name = session.user.name || "Foydalanuvchi"
  const phone = session.user.phone || ""
  const initial = (name || phone || "S").charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950">
      <Navbar />

      <main className="pb-24 max-w-6xl mx-auto px-3 sm:px-6 pt-4">
        {/* ========== IXCHAM HEADER KARTA (banner yo'q) ========== */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center gap-3.5">
          {/* Kichik gradient avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center text-white text-xl font-extrabold shadow-md shadow-green-400/30 flex-shrink-0">
            {initial}
          </div>

          {/* Ism + telefon */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-gray-900 dark:text-white truncate">
              {name}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {phone || session.user.email || "Email yo'q"}
            </div>
          </div>

          {/* Tahrirlash */}
          <ProfileEditSheet initialName={name} initialPhone={phone} />
        </div>

        {/* ========== STATISTIKA (to'g'ridan-to'g'ri ostida) ========== */}
        <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <Link href="/my-listings" className="py-3.5 text-center active:bg-gray-50 dark:active:bg-zinc-800 rounded-l-2xl transition-colors">
            <div className="text-lg font-extrabold text-gray-900 dark:text-white">{total}</div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500">E'lonlarim</div>
          </Link>
          <Link href="/my-listings" className="py-3.5 text-center active:bg-gray-50 dark:active:bg-zinc-800 transition-colors">
            <div className="text-lg font-extrabold text-green-500">{active}</div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500">Faol</div>
          </Link>
          <Link href="/favorites" className="py-3.5 text-center active:bg-gray-50 dark:active:bg-zinc-800 rounded-r-2xl transition-colors">
            <div className="text-lg font-extrabold text-red-500">{favs}</div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500">Sevimlilar</div>
          </Link>
        </div>

        {/* ========== MENYU ========== */}
        <div className="mt-5">
          <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 px-1">
            Menyu
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl divide-y divide-gray-50 dark:divide-zinc-800/60 shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden">
            {MENU.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 dark:active:bg-zinc-800 transition-colors"
                >
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300 dark:text-zinc-600" />
                </Link>
              )
            })}
            <LogoutItem />
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}
