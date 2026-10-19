import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import Categories from "@/components/Categories"
import FeaturedListings from "@/components/FeaturedListings"
import HomeListings from "@/components/HomeListings"
import Advantages from "@/components/Advantages"
import Footer from "@/components/Footer"
import MobileNav from "@/components/MobileNav"

export const revalidate = 60

export const metadata = {
  title: "Olsot Market — O'zbekistondagi ishonchli ko'chmas mulk platformasi",
  description:
    "Kvartira, uy, ofis va yer e'lonlari — sotib olish, ijaraga. Xaritada qidiring, to'g'ridan-to'g'ri sotuvchi bilan bog'laning.",
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7FBF8] dark:bg-zinc-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-3 sm:px-6">
        <Hero />
        <Categories />
        <FeaturedListings />
        <HomeListings />
        <Advantages />
      </main>
      <Footer />
      <MobileNav />
    </div>
  )
}
