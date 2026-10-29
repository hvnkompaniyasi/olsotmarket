import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function AdminEditListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <Link href={`/admin/listings/${listing.id}`} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">E'lonni tahrirlash (Admin)</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form action={async (formData) => {
          "use server"
          const title = formData.get("title") as string
          const price = parseFloat(formData.get("price") as string)
          const description = formData.get("description") as string
          
          await prisma.listing.update({
            where: { id: listing.id },
            data: { title, price, description }
          })
        }} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Sarlavha</label>
            <input name="title" defaultValue={listing.title} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Narx</label>
            <input name="price" type="number" defaultValue={listing.price} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Tavsif</label>
            <textarea name="description" defaultValue={listing.description} rows={5} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition-colors">Saqlash</button>
        </form>
      </div>
    </div>
  )
}
