"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { LogOut, UserRound } from "lucide-react"
import ChatNavLink from "@/components/ChatNavLink"
import Logo from "@/components/ui/Logo"

const linkCls =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"

export default function Navbar() {
  const { data: session } = useSession()
  const profileHref = session ? "/profile" : "/login?callbackUrl=/profile"

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 pt-[env(safe-area-inset-top)] shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Olsot Market — bosh sahifa" className="flex min-w-0">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy navigatsiya">
          <Link href="/" className={linkCls}>Bosh sahifa</Link>
          <Link href="/listings?type=SALE" className={linkCls}>Sotib olish</Link>
          <Link href="/listings?type=RENT" className={linkCls}>Ijaraga</Link>
          <Link href="/favorites" className={linkCls}>Sevimlilar</Link>
          <Link href="/listings" className={linkCls}>Barcha e&apos;lonlar</Link>
          <Link href="/map" className={linkCls}>Xarita</Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <span className="flex h-11 w-11 items-center justify-center">
            <ChatNavLink />
          </span>
          <Link
            href={profileHref}
            aria-label={session ? "Profil" : "Kirish"}
            className="flex h-11 w-11 items-center justify-center rounded-full text-emerald-900 transition hover:bg-emerald-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-800 text-white shadow-sm">
              {session?.user?.name ? (
                <span className="text-sm font-bold">
                  {session.user.name.trim().slice(0, 1).toLocaleUpperCase()}
                </span>
              ) : (
                <UserRound className="h-4 w-4" />
              )}
            </span>
          </Link>
          {session && (
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              aria-label="Chiqish"
              className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 sm:flex"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
