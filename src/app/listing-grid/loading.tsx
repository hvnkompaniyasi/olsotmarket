// Bosh sahifa/rout uchun skeleton loading ko'rinishi
export default function Loading() {
  return (
    <section className="max-w-6xl mx-auto px-3 sm:px-6 py-8 animate-pulse">
      <div className="h-7 w-48 bg-gray-200 dark:bg-zinc-800 rounded mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800"
          >
            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-zinc-800" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
