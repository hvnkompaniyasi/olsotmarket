import type { Metadata } from "next"
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

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const listing = await prisma.listing.findFirst({
    where: { OR: [{ id: params.id }, { slug: params.id }] },
    select: {
      slug: true,
      title: true,
      description: true,
      images: true,
      price: true,
      type: true,
      currency: true,
    },
  })
  if (!listing) return { title: "E'lon topilmadi | Olsot Market" }
  const dealName = DEAL_TYPES.find((deal) => deal.id === listing.type)?.name || listing.type

  return {
    title: `${listing.title} — ${formatPrice(listing.price, dealName, listing.currency)} | Olsot Market`,
    description: (listing.description || listing.title).slice(0, 160),
    alternates: { canonical: `/listing/${listing.slug ?? params.id}` },
    openGraph: {
      title: listing.title,
      description: (listing.description || "").slice(0, 120),
      images: listing.images[0] ? [listing.images[0]] : [],
    },
  }
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const [session, listing] = await Promise.all([
    getServerSession(authOptions),
    prisma.listing.findFirst({
      where: { OR: [{ id: params.id }, { slug: params.id }] },
      include: { user: { select: { name: true, phone: true } } },
    }),
  ])

  if (!listing || listing.status !== "ACTIVE") notFound()
  if (listing.slug && params.id !== listing.slug) {
    redirect(`/listing/${encodeURIComponent(listing.slug)}`)
  }

  const isFavorite = session?.user?.id
    ? Boolean(
        await prisma.favorite.findFirst({
          where: { userId: session.user.id, listingId: listing.id },
          select: { id: true },
        })
      )
    : false
  const dealName = DEAL_TYPES.find((deal) => deal.id === listing.type)?.name || listing.type
  const price = formatPrice(listing.price, dealName, listing.currency)

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-24 lg:pb-28">
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
