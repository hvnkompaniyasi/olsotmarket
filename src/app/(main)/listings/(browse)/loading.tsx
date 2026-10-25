import Footer from "@/components/Footer"
import ListingSkeleton from "@/components/ListingSkeleton"
import MobileNav from "@/components/MobileNav"
import Navbar from "@/components/Navbar"

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-3 pb-24 sm:px-6 lg:pb-10" aria-busy="true">
        <div className="flex items-center justify-between gap-3 pt-4 pb-3">
          <div className="space-y-2">
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200 motion-reduce:animate-none dark:bg-zinc-800" />
            <div className="h-3 w-40 animate-pulse rounded bg-gray-100 motion-reduce:animate-none dark:bg-zinc-900" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200 motion-reduce:animate-none dark:bg-zinc-800" />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-11 animate-pulse rounded-xl bg-white motion-reduce:animate-none dark:bg-zinc-900"
            />
          ))}
        </div>
        <div className="mb-3 flex justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 motion-reduce:animate-none dark:bg-zinc-800" />
          <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-200 motion-reduce:animate-none dark:bg-zinc-800" />
        </div>
        <ListingSkeleton />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
