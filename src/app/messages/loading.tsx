export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] dark:bg-zinc-950">
      {/* Navbar uchun skelet */}
      <div className="h-16 w-full border-b border-gray-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur animate-pulse" />

      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 sm:py-6">
        {/* Sarlavha */}
        <div className="mb-4 space-y-2">
          <div className="h-7 w-1/4 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-100 dark:bg-zinc-800/50 rounded animate-pulse" />
        </div>

        {/* Chat interfeysi skeleti */}
        <div className="flex h-[75vh] w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          
          {/* Chap panel (Suhbatlar ro'yxati) */}
          <div className="hidden w-1/3 flex-col border-r border-gray-100 p-4 dark:border-zinc-800 md:flex animate-pulse">
            <div className="mb-4 h-11 w-full rounded-xl bg-gray-100 dark:bg-zinc-800" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded-full bg-gray-100 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 rounded bg-gray-100 dark:bg-zinc-800" />
                  <div className="h-2.5 w-3/4 rounded bg-gray-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))}
          </div>
          
          {/* O'ng panel (Xabarlar oynasi) */}
          <div className="flex flex-1 flex-col justify-between animate-pulse">
            {/* Chat sarlavhasi */}
            <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-zinc-800" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded bg-gray-100 dark:bg-zinc-800" />
                  <div className="h-2.5 w-16 rounded bg-gray-100 dark:bg-zinc-800" />
                </div>
              </div>
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-zinc-800" />
            </div>

            {/* Xabarlar maydoni */}
            <div className="flex-1 space-y-4 p-4">
              <div className="h-12 w-2/3 rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-zinc-800" />
              <div className="ml-auto h-12 w-1/2 rounded-2xl rounded-tr-sm bg-emerald-100/50 dark:bg-emerald-900/20" />
              <div className="h-16 w-3/4 rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-zinc-800" />
              <div className="ml-auto h-10 w-2/5 rounded-2xl rounded-tr-sm bg-emerald-100/50 dark:bg-emerald-900/20" />
              <div className="h-10 w-1/2 rounded-2xl rounded-tl-sm bg-gray-100 dark:bg-zinc-800" />
            </div>

            {/* Xabar yuborish maydoni */}
            <div className="border-t border-gray-100 p-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="h-12 flex-1 rounded-xl bg-gray-100 dark:bg-zinc-800" />
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}