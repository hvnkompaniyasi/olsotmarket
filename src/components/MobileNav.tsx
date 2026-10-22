"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Plus, MapPin, User } from "lucide-react"

export default function MobileNav() {
  const pathname = usePathname()


  const items = [
    { href: "/", icon: Home, label: "Bosh" },
    { href: "/listings", icon: Search, label: "Qidiruv" },
    { href: "/listings/create", icon: Plus, label: "", center: true },
    { href: "/map", icon: MapPin, label: "Xarita" },
    { href: "/profile", icon: User, label: "Profil" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-gray-200 dark:border-zinc-800">
      <div className="flex items-end justify-around px-2 pb-2 pt-1">
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          if (item.center) {
            return (
              <Link key={item.href} href={item.href} aria-label="E'lon qo'shish" className="-mt-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-400/40 border-4 border-white dark:border-zinc-900">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </Link>
            )
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
