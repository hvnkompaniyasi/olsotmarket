import Link from "next/link"
import { Search, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-950 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* 404 Raqami (Animatsiya bilan) */}
        <div className="text-8xl sm:text-9xl font-extrabold bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent drop-shadow-sm select-none animate-in fade-in zoom-in duration-500">
          404
        </div>
        
        {/* Sarlavha va Tavsif */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Sahifa topilmadi
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
            E&apos;lon o&apos;chirilgan, nomi o&apos;zgargan yoki havola eskirgan bo&apos;lishi mumkin.
          </p>
        </div>

        {/* Tugmalar (Mobil uchun moslashgan) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link 
            href="/listings" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-green-500/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            <Search className="h-4 w-4" /> E&apos;lonlarni ko&apos;rish
          </Link>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/90 hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-200 font-bold rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            <Home className="h-4 w-4" /> Bosh sahifa
          </Link>
        </div>

      </div>
    </div>
  )
}