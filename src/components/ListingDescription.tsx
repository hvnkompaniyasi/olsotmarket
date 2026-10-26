"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function ListingDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-2 text-base font-bold text-gray-900">Tavsif</h2>
      <p className={`whitespace-pre-line text-xs leading-relaxed text-gray-600 ${expanded ? "" : "line-clamp-4"}`}>
        {text}
      </p>
      {text.length > 180 && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"
        >
          {expanded ? "Qisqartirish" : "Barchasini ko'rish"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </section>
  )
}
