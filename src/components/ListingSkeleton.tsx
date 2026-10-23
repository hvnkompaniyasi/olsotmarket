export default function ListingSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-3 gap-3"
      role="status"
      aria-label="E'lonlar yuklanmoqda"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-emerald-100 shadow-[0_8px_30px_rgba(10,124,78,0.10)] dark:bg-zinc-900"
        >
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-emerald-100 via-emerald-50 to-emerald-200 motion-reduce:animate-none dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800" />
          <div className="absolute inset-x-3 top-3 flex justify-between">
            <div className="h-6 w-16 animate-pulse rounded-full bg-white/50 motion-reduce:animate-none dark:bg-white/10" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/50 motion-reduce:animate-none dark:bg-white/10" />
          </div>
          <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/70 to-transparent p-3 pt-12">
            <div className="h-6 w-2/3 animate-pulse rounded bg-white/40 motion-reduce:animate-none" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-white/30 motion-reduce:animate-none" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/25 motion-reduce:animate-none" />
            <div className="h-7 w-2/3 animate-pulse rounded-xl bg-white/25 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
      <span className="sr-only">Yuklanmoqda...</span>
    </div>
  )
}
