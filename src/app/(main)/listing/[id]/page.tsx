import type { Metadata } from "next"
import { cache } from "react"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/auth"
import { authOptions } from "@/lib/auth-options"
import { formatPrice } from "@/lib/format"
import { DEAL_TYPES } from "@/lib/locations"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import ListingDetailContent from "@/components/ListingDetailContent"
import ListingStickyActions from "@/components/ListingStickyActions"

export const revalidate = 3600

const categoryNames: Record<string, string> = {
  APARTMENT: "Kvartira",
  HOUSE: "Uy / Hovli",
  OFFICE: "Ofis",
  LAND: "Yer uchastkasi",
  WAREHOUSE: "Ombor",
}

interface ListingPageProps {
  params: { id: string }
}

// REACT.CACHE: generateMetadata va asosiy sahifa bitta so'rovdan foydalanadi (bazani tejaydi)
const getListing = cache(async (id: string) => {
  return prisma.listing.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { user: { select: { name: true, phone: true } } },
  })
})

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await getListing(params.id)
  if (!listing) return { title: "E'lon topilmadi | Olsot Market" }
  
  // XATO TUZATILDI: dealName olib tashlandi, faqat valyuta qoldi
  const formattedPrice = formatPrice(listing.price, listing.currency)

  return {
    title: `${listing.title} — ${formattedPrice} | Olsot Market`,
    description: (listing.description || listing.title).slice(0, 160),
    alternates: { canonical: `/listing/${listing.slug ?? params.id}` },
    openGraph: {
      title: listing.title,
      description: (listing.description || "").slice(0, 120),
      images: listing.images[0] ? [listing.images[0]] : [],
      type: "article",
    },
  }
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  // Parallel ma'lumot olish (Sessiya va E'lon bir vaqtda)
  const [session, listing] = await Promise.all([
    getServerSession(authOptions),
    getListing(params.id),
  ])

  if (!listing || listing.status !== "ACTIVE") notFound()
  
  if (listing.slug && params.id !== listing.slug) {
    redirect(`/listing/${encodeURIComponent(listing.slug)}`)
  }

  // Sevimlilarni tekshirish (faqat sessiya bo'lsa)
  const isFavorite = session?.user?.id
    ? Boolean(
        await prisma.favorite.findFirst({
          where: { userId: session.user.id, listingId: listing.id },
          select: { id: true },
        })
      )
    : false

  // XATO TUZATILDI: formatPrice to'g'ri chaqirildi
  const price = formatPrice(listing.price, listing.currency)

  return (
    <div className="min-h-screen bg-[#f9f9ff] dark:bg-zinc-950 pb-24 lg:pb-28">
      <div className="hidden md:block">
        <Navbar />
      </div>
      
      <ListingDetailContent
        listing={listing}
        isFavorite={isFavorite}
        price={price}
        category={categoryNames[listing.category] || listing.category}
      />
      
      <ListingStickyActions listingId={listing.id} phone={listing.user.phone} />
      
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  )
}