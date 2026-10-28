import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Eye, Lock, UserCheck } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import MobileNav from "@/components/MobileNav"

export const metadata: Metadata = {
  title: "Maxfiylik siyosati | Olsot Market",
  description: "Olsot Market platformasida shaxsiy ma'lumotlaringiz qanday yig'ilishi va himoya qilinishi haqida ma'lumot.",
  openGraph: {
    title: "Maxfiylik siyosati | Olsot Market",
    description: "Shaxsiy ma'lumotlaringiz xavfsizligi kafolatlanadi.",
    url: "https://olsotmarket.uz/privacy",
  },
}

export default function PrivacyPage() {
  const lastUpdated = "25-Oktabr, 2026-yil"

  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-0">
      <Navbar />
      
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          
          {/* Sahifa sarlavhasi */}
          <div className="border-b border-gray-100 bg-gray-50/50 p-6 sm:p-10 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Maxfiylik siyosati
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Oxirgi yangilanish: {lastUpdated}
            </p>
          </div>

          {/* Sahifa matni (Kontent) */}
          <div className="p-6 sm:p-10 space-y-8 text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
            
            <section>
              <p className="font-medium text-gray-900 dark:text-white mb-3">
                Olsot Market uchun foydalanuvchilarimizning shaxsiy ma&apos;lumotlari maxfiyligi va xavfsizligi eng muhim ustuvorliklardan biridir. Ushbu siyosat orqali biz qanday ma&apos;lumotlarni to&apos;plashimiz, ulardan foydalanishimiz va qanday himoya qilishimizni tushuntiramiz.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                  <UserCheck className="h-4 w-4" />
                </span>
                Qanday ma&apos;lumotlarni yig&apos;amiz?
              </h2>
              <ul className="list-disc list-inside space-y-2 pl-2 marker:text-green-500">
                <li><strong>Ro&apos;yxatdan o&apos;tish ma&apos;lumotlari:</strong> Ismingiz, telefon raqamingiz, email manzilingiz (ixtiyoriy).</li>
                <li><strong>E&apos;lon ma&apos;lumotlari:</strong> Siz joylashtirgan ko&apos;chmas mulk rasmlari, manzillari va tavsiflari.</li>
                <li><strong>Texnik ma&apos;lumotlar:</strong> Saytdan foydalanish jarayonida IP manzil, brauzer turi va qurilma ma&apos;lumotlari (xavfsizlik va statistika uchun).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                  <Eye className="h-4 w-4" />
                </span>
                Ma&apos;lumotlardan qanday foydalanamiz?
              </h2>
              <ul className="list-disc list-inside space-y-2 pl-2 marker:text-green-500">
                <li>Platforma xizmatlarini to&apos;g&apos;ri va xavfsiz taqdim etish uchun.</li>
                <li>Foydalanuvchilar o&apos;rtasida aloqani (sotuvchi va xaridor) yo&apos;lga qo&apos;yish uchun.</li>
                <li>Firibgarlik va spamlarning oldini olish uchun.</li>
                <li><strong>Muhim:</strong> Sizning shaxsiy ma&apos;lumotlaringiz hech qachon uchinchi shaxslarga sotilmaydi.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                Ma&apos;lumotlarni himoya qilish
              </h2>
              <p>
                Barcha ma&apos;lumotlar yuqori darajadagi shifrlash (SSL/TLS) orqali uzatiladi. Foydalanuvchi parollari bazada hech qachon ochiq holda saqlanmaydi — ular <strong>bcrypt</strong> algoritmi yordamida xavfsiz shifrlanadi. Shuningdek, tizimda faqat ruxsat etilgan administratorlar ma&apos;lumotlarga kira oladi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-400">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                Sizning huquqlaringiz
              </h2>
              <p>
                Siz o&apos;zingizga tegishli bo&apos;lgan barcha ma&apos;lumotlarni ko&apos;rish, tahrirlash huquqiga egasiz. Agar akkauntingizni butunlay o&apos;chirib tashlamoqchi bo&apos;lsangiz, profilingiz orqali yoki biz bilan bog&apos;lanish orqali so&apos;rov yuborishingiz mumkin.
              </p>
            </section>

            {/* Aloqa qismi */}
            <div className="mt-10 rounded-2xl bg-gray-50 p-6 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Savollaringiz bormi?</h3>
              <p className="mb-4">Agar maxfiylik siyosati bo&apos;yicha savollaringiz yoki shubhalaringiz bo&apos;lsa, biz bilan bog&apos;laning.</p>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-green-800">
                Qo&apos;llab-quvvatlash xizmati
              </Link>
            </div>

          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </div>
  )
}