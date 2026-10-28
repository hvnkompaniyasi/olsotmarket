export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24">
      {/* Navbar uchun skelet (agar sahifa ichida bo'lsa) */}
      <div className="h-16 w-full border-b border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur animate-pulse" />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-4">
        
        {/* 1. Profil Header Karta (Rasm, Ism, Tahrirlash tugmasi) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center gap-3.5 animate-pulse">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-gray-200 dark:bg-zinc-800 flex-shrink-0" />
          
          {/* Ism va Telefon */}
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-md" />
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded-md" />
          </div>
          
          {/* Tahrirlash tugmasi */}
          <div className="h-9 w-24 bg-gray-100 dark:bg-zinc-800 rounded-xl flex-shrink-0" />
        </div>

        {/* 2. Statistika bloki */}
        <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-4 flex flex-col items-center justify-center gap-2">
              <div className="h-5 w-8 bg-gray-200 dark:bg-zinc-800 rounded-md" />
              <div className="h-3 w-12 bg-gray-200 dark:bg-zinc-800 rounded-md" />
            </div>
          ))}
        </div>

        {/* 3. Menyu bo'limi */}
        <div className="mt-6">
          {/* "Menyu" sarlavhasi */}
          <div className="h-4 w-16 bg-gray-200 dark:bg-zinc-800 rounded mb-3 ml-1 animate-pulse" />
          
          {/* Menyu qatorlari */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden divide-y divide-gray-50 dark:divide-zinc-800/60 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                {/* Ikonka */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex-shrink-0" />
                {/* Matn */}
                <div className="h-4 w-1/3 bg-gray-100 dark:bg-zinc-800 rounded-md" />
                {/* O'qcha (Chevron) */}
                <div className="ml-auto h-4 w-4 bg-gray-100 dark:bg-zinc-800 rounded-full" />
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  )
}