import type { Metadata } from "next"
import Link from "next/link"
import { MessageSquare, Phone, Mail, MapPin, Clock, ArrowLeft } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import MobileNav from "@/components/MobileNav"

export const metadata: Metadata = {
  title: "Aloqa | Olsot Market",
  description: "Olsot Market qo'llab-quvvatlash xizmati bilan bog'lanish uchun barcha ma'lumotlar.",
  openGraph: {
    title: "Aloqa | Olsot Market",
    description: "Savollaringiz bormi? Biz bilan bog'laning.",
    url: "https://olsotmarket.uz/contact",
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-0">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          
          {/* Sahifa sarlavhasi */}
          <div className="border-b border-gray-100 bg-gray-50/50 p-6 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Biz bilan bog&apos;lanish
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Savollaringiz, takliflaringiz yoki shikoyatlaringiz bo&apos;lsa, bemalol murojaat qiling.
            </p>
          </div>

          {/* Kontakt ma'lumotlari */}
          <div className="p-6 sm:p-10 space-y-4">
            
            {/* Telefon */}
            <a 
              href="tel:+998330070150"
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-[#0A7C4E] dark:hover:border-emerald-500 hover:bg-green-50/50 dark:hover:bg-emerald-500/5 transition-all group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 group-hover:bg-[#0A7C4E] group-hover:text-white transition-colors">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Qo&apos;ng&apos;iroq qilish</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0A7C4E] dark:group-hover:text-emerald-500 transition-colors">
                  +998 33 007 01 50
                </p>
              </div>
            </a>

            {/* Email */}
            <a 
              href="mailto:frlking2007@gmail.com"
              className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 hover:border-[#0A7C4E] dark:hover:border-emerald-500 hover:bg-green-50/50 dark:hover:bg-emerald-500/5 transition-all group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 group-hover:bg-[#0A7C4E] group-hover:text-white transition-colors">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Elektron pochta</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#0A7C4E] dark:group-hover:text-emerald-500 transition-colors">
                  frlking2007@gmail.com
                </p>
              </div>
            </a>

            {/* Manzil */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Manzil</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Toshkent shahri, Amir Temur ko&apos;chasi, 108-uy
                </p>
              </div>
            </div>

            {/* Ish vaqti */}
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-300">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Ish vaqti</p>
                <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Dushanba - Shanba, 9:00 dan 18:00 gacha
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}