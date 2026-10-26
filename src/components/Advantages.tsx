import { ShieldCheck } from "lucide-react"

export default function Advantages() {
  return (
    <section className="pb-6 pt-1">
      <div className="flex items-center gap-3 rounded-2xl bg-[#f1f3ff] p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-800 shadow-sm">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-950">
            Xavfsiz va shaffof bitimlar
          </h2>
          <p className="mt-0.5 text-xs leading-5 text-slate-600">
            E&apos;lonlar moderatsiyadan o&apos;tkaziladi
          </p>
        </div>
      </div>
    </section>
  )
}
