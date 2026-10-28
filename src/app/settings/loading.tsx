export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950 pb-24 lg:pb-10">
      {/* Navbar uchun skelet (agar u sahifa ichida bo'lsa) */}
      <div className="h-16 border-b border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur animate-pulse" />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-5 space-y-6">
        
        {/* Sahifa sarlavhasi (Title va Subtitle) */}
        <div className="space-y-2">
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* 1-bo'lim: Profil ma'lumotlari kartasi */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-5">
          <div className="h-6 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
          
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>

          <div className="h-12 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-xl mt-2 animate-pulse" />
        </div>

        {/* 2-bo'lim: Xavfsizlik / Parolni o'zgartirish kartasi */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-zinc-800 space-y-5">
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
          
          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="h-3 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
          </div>

          <div className="h-12 w-1/3 bg-gray-200 dark:bg-zinc-800 rounded-xl mt-2 animate-pulse" />
        </div>

        {/* 3-bo'lim: Xavfli hudud (O'chirish tugmasi) */}
        <div className="bg-red-50 dark:bg-red-500/5 rounded-2xl p-4 sm:p-6 border border-red-100 dark:border-red-900/30 space-y-4">
          <div className="h-6 w-1/3 bg-red-200 dark:bg-red-900/50 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-red-100 dark:bg-red-900/30 rounded animate-pulse" />
          <div className="h-12 w-1/4 bg-red-200 dark:bg-red-900/50 rounded-xl mt-2 animate-pulse" />
        </div>

      </main>
    </div>
  )
}