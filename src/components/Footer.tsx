import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"
import Logo from "@/components/ui/Logo"

const LINKS = [
  { href: "/listings?deal=SALE", label: "Sotib olish" },
  { href: "/listings?deal=RENT", label: "Ijaraga" },
  { href: "/listings", label: "Barcha e'lonlar" },
  { href: "/map", label: "Xarita" },
  { href: "/listings/create", label: "E'lon qo'shish" },
]

export default function Footer() {
  return (
    <footer className="bg-white/80 dark:bg-zinc-900/80 border-t border-green-100/60 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-10 pb-8 text-center lg:pb-12">
        <Link href="/" aria-label="Olsot Market — bosh sahifa" className="mb-2 inline-flex justify-center">
          <Logo size="sm" />
        </Link>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          O&apos;zbekistondagi ishonchli ko&apos;chmas mulk platformasi
        </p>

        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-7">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#0A7C4E] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[11px] text-gray-400 dark:text-gray-500 mb-7">
          <a href="tel:+998330070150" className="inline-flex items-center gap-1 hover:text-[#0A7C4E]">
            <Phone className="h-3 w-3" /> +998 33 007 01 50
          </a>
          <a href="mailto:frlking2007@gmail.com" className="inline-flex items-center gap-1 hover:text-[#0A7C4E]">
            <Mail className="h-3 w-3" /> frlking2007@gmail.com
          </a>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Toshkent sh.
          </span>
        </div>

        <div className="w-16 h-px bg-gray-200 dark:bg-zinc-800 mx-auto mb-4" />
        <p className="text-[11px] text-gray-400 dark:text-gray-600">
          © 2026 Olsot Market. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </footer>
  )
}
