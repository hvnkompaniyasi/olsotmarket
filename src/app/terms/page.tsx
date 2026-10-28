import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, FileText } from "lucide-react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import MobileNav from "@/components/MobileNav"

export const metadata: Metadata = {
  title: "Foydalanish shartlari | Olsot Market",
  description: "Olsot Market platformasidan foydalanish qoidalari va shartlari.",
  openGraph: {
    title: "Foydalanish shartlari | Olsot Market",
    description: "Platformadan foydalanish qoidalari va foydalanuvchi majburiyatlari.",
    url: "https://olsotmarket.uz/terms",
  },
}

export default function TermsPage() {
  const lastUpdated = "25-Oktabr, 2026-yil" // Sanani kerak bo'lganda yangilab turing

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
                Foydalanish shartlari
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
                Olsot Market platformasidan foydalanish orqali siz quyidagi shartlarga to'liq rozilik bildirasiz. Iltimos, ushbu qoidalarni diqqat bilan o'qib chiqing.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700 dark:bg-green-500/10 dark:text-green-400">1</span>
                E'lon joylashtirish qoidalari
              </h2>
              <ul className="list-disc list-inside space-y-2 pl-2 marker:text-green-500">
                <li>E'lonlar faqat <strong>haqiqiy va tasdiqlangan</strong> ma'lumotlarni o'z ichiga olishi shart.</li>
                <li>Yolg'on, aldamchi yoki qonunga xilof e'lonlar darhol o'chiriladi.</li>
                <li>Bir xil e'lonni bir necha marta (spam) joylashtirish taqiqlanadi.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700 dark:bg-green-500/10 dark:text-green-400">2</span>
                Foydalanuvchi majburiyatlari
              </h2>
              <p>Platformadan foydalanishda siz quyidagilarga rozilik bildirasiz:</p>
              <ul className="list-disc list-inside space-y-2 pl-2 marker:text-green-500">
                <li>Boshqa foydalanuvchilarga nisbatan hurmat va odob-axloq qoidalariga rioya qilish.</li>
                <li>O'zingizga tegishli bo'lmagan akkaunt yoki ma'lumotlardan foydalanmaslik.</li>
                <li>Platforma xavfsizligiga tahdid soluvchi har qanday harakatlardan tiyilish.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700 dark:bg-green-500/10 dark:text-green-400">3</span>
                Javobgarlikni cheklash
              </h2>
              <p>
                Olsot Market — bu faqat e'lonlarni joylashtirish va ko'rish uchun mo'ljallangan platforma. Platforma foydalanuvchilar o'rtasidagi moliyaviy bitimlar, ko'chmas mulkning sifati yoki qonuniyligi uchun to'g'ridan-to'g'ri javobgar emas. Mojaroli holatlar yuzaga kelganda, biz qonuniy doiralarda yordam ko'rsatishga tayyormiz.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700 dark:bg-green-500/10 dark:text-green-400">4</span>
                To'lovlar va xizmatlar
              </h2>
              <p>
                Platformaning asosiy xizmatlari (e'lonlarni ko'rish, qidirish) mutlaqo bepul. Kelajakda qo'shimcha imkoniyatlar (masalan, VIP e'lonlar yoki e'lonni yuqoriga ko'tarish) pullik bo'lishi mumkin. Pullik xizmatlar haqida ma'lumot oldindan ko'rsatiladi.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700 dark:bg-green-500/10 dark:text-green-400">5</span>
                Akkauntni bloklash
              </h2>
              <p>
                Ushbu shartlarni buzgan yoki boshqa foydalanuvchilardan shikoyat kelib tushgan taqdirda, ma'muriyat akkauntingizni ogohlantirishsiz vaqtincha yoki butunlay bloklash huquqini o'zida saqlab qoladi.
              </p>
            </section>

            {/* Aloqa qismi */}
            <div className="mt-10 rounded-2xl bg-gray-50 p-6 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                Savollaringiz bormi?
              </h3>
              <p className="mb-4">Agar ushbu shartlar bo'yicha savollaringiz yoki takliflaringiz bo'lsa, biz bilan bog'laning.</p>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-800">
                Biz bilan bog'lanish
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