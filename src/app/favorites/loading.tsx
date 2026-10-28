export default function FavoritesLoading() {
  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-10">
      {/* Navbar uchun skelet */}
      <div className="h-16 w-full border-b border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur animate-pulse" />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5">
        
        {/* Sarlavha va Sub-sarlavha uchun skelet */}
        <div className="flex items-center gap-2.5 mb-1 animate-pulse">
          <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-zinc-800" /> {/* Heart icon */}
          <div className="h-7 w-32 rounded-lg bg-gray-200 dark:bg-zinc-800" /> {/* Title */}
        </div>
        <div className="h-4 w-24 rounded bg-gray-100 dark:bg-zinc-800/50 mb-5 animate-pulse" /> {/* Count */}

        {/* Kartochkalar Grid (Sevimlilar) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* 6 ta skelet kartochka */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm animate-pulse"
            >
              {/* Rasm qismi */}
              <div className="relative h-32 sm:h-44 bg-gray-200 dark:bg-zinc-800" />
              
              {/* Matn qismi (Narx, Sarlavha, Manzil) */}
              <div className="p-3 sm:p-4 space-y-2.5">
                <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-zinc-800/60" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}