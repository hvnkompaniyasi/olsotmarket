"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Map, Plus, Search, UserRound } from "lucide-react"

const items = [
  { href: "/", icon: House, label: "Bosh" },
  { href: "/listings", icon: Search, label: "Qidiruv" },
  { href: "/listings/create", icon: Plus, label: "E'lon", center: true },
  { href: "/map", icon: Map, label: "Xarita" },
  { href: "/profile", icon: UserRound, label: "Profil" },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobil navigatsiya"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-100 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(17,24,39,0.05)] backdrop-blur-xl lg:hidden"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-1">
        {items.map((item) => {
          const Icon = item.icon
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)

          if (item.center) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label="E'lon qo'shish"
                className="relative -top-3 flex min-w-[56px] flex-col items-center"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-800 text-white shadow-[0_8px_18px_-2px_rgba(0,106,57,0.38)] transition active:scale-95">
                  <Icon className="h-7 w-7" />
                </span>
                <span className="mt-1 text-[11px] font-medium text-gray-700">
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-14 min-w-[56px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                active ? "text-emerald-800" : "text-slate-600 hover:text-emerald-800"
              }`}
            >
              <Icon className="h-[22px] w-[22px]" />
              <span className="text-[11px] font-medium leading-4">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
