"use client"

import MessageButton from "@/components/MessageButton"
import PhoneReveal from "@/components/PhoneReveal"

interface ListingStickyActionsProps {
  listingId: string
  phone: string | null
}

export default function ListingStickyActions({ listingId, phone }: ListingStickyActionsProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 py-3 shadow-[0_-5px_20px_rgba(17,24,39,0.06)] backdrop-blur-md [padding-bottom:calc(0.75rem+env(safe-area-inset-bottom))] lg:bottom-4 lg:left-1/2 lg:w-[min(430px,calc(100%-2rem))] lg:-translate-x-1/2 lg:rounded-2xl lg:border">
      <div className="mx-auto flex max-w-md items-center gap-2.5">
        <MessageButton
          listingId={listingId}
          className="h-11 flex-1 rounded-xl border border-emerald-600/40 bg-emerald-50 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100"
        />
        <PhoneReveal phone={phone} sticky />
      </div>
    </div>
  )
}
