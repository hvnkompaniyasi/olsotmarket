import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { revalidatePath } from "next/cache"

export default async function AdminEditListingPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing) notFound()

  async function updateListing(formData: FormData) {
    "use server"
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        currency: formData.get("currency") as string,
        type: formData.get("type") as any,
        category: formData.get("category") as any,
        status: formData.get("status") as any,
        region: formData.get("region") as string,
        district: formData.get("district") as string,
        address: formData.get("address") as string,
        rooms: formData.get("rooms") ? parseInt(formData.get("rooms") as string) : null,
        area: formData.get("area") ? parseFloat(formData.get("area") as string) : null,
        floor: formData.get("floor") ? parseInt(formData.get("floor") as string) : null,
        totalFloors: formData.get("totalFloors") ? parseInt(formData.get("totalFloors") as string) : null,
        latitude: formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null,
        longitude: formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null,
        hasGas: formData.get("hasGas") === "on",
        hasWater: formData.get("hasWater") === "on",
        hasElectricity: formData.get("hasElectricity") === "on",
        furniture: formData.get("furniture") === "on",
      }
    })
    revalidatePath("/admin/listings")
    revalidatePath(`/admin/listings/${listing.id}`)
    redirect(`/admin/listings/${listing.id}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <Link href={`/admin/listings/${listing.id}`} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">E'lonni to'liq tahrirlash</h1>
      </div>

      <form action={updateListing} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-emerald-700 border-b pb-2">Asosiy ma'lumotlar</h2>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Sarlavha</label>
            <input name="title" defaultValue={listing.title} required className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Tavsif</label>
            <textarea name="description" defaultValue={listing.description} rows={4} required className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-lg text-emerald-700 border-b pb-2">Narx va Status</h2>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Narx</label>
              <input name="price" type="number" defaultValue={listing.price} required className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="w-24">
              <label className="text-xs font-semibold text-gray-500 block mb-1">Valyuta</label>
              <select name="currency" defaultValue={listing.currency} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
            <select name="status" defaultValue={listing.status} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="PENDING">KUTILMOQDA</option>
              <option value="ACTIVE">FAOL</option>
              <option value="REJECTED">RAD ETILGAN</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold text-lg text-emerald-700 border-b pb-2">Turi</h2>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Bitim turi</label>
            <select name="type" defaultValue={listing.type} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="SALE">Sotuv</option>
              <option value="RENT">Ijara</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Kategoriya</label>
            <select name="category" defaultValue={listing.category} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
              <option value="APARTMENT">Kvartira</option>
              <option value="HOUSE">Hovli</option>
              <option value="LAND">Yer</option>
              <option value="OFFICE">Ofis</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-emerald-700 border-b pb-2">Manzil va Xarita</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Viloyat</label>
              <input name="region" defaultValue={listing.region} required className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Tuman</label>
              <input name="district" defaultValue={listing.district} required className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Manzil (ko'cha)</label>
              <input name="address" defaultValue={listing.address} required className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Kenglik (Latitude)</label>
              <input name="latitude" type="number" step="any" defaultValue={listing.latitude || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Uzunlik (Longitude)</label>
              <input name="longitude" type="number" step="any" defaultValue={listing.longitude || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-emerald-700 border-b pb-2">Xususiyatlar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Xonalar</label>
              <input name="rooms" type="number" defaultValue={listing.rooms || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Maydon (m²)</label>
              <input name="area" type="number" step="any" defaultValue={listing.area || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Qavat</label>
              <input name="floor" type="number" defaultValue={listing.floor || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Jami qavat</label>
              <input name="totalFloors" type="number" defaultValue={listing.totalFloors || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 mt-4 bg-gray-50 p-4 rounded-xl">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" name="hasGas" defaultChecked={listing.hasGas} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" /> Gaz
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" name="hasWater" defaultChecked={listing.hasWater} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" /> Suv
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" name="hasElectricity" defaultChecked={listing.hasElectricity} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" /> Svet
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="checkbox" name="furniture" defaultChecked={listing.furniture || false} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" /> Jixoz (Mebel)
            </label>
          </div>
        </div>

        <div className="md:col-span-2 pt-4 border-t border-gray-100 flex justify-end">
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
            Barcha o'zgarishlarni saqlash
          </button>
        </div>
      </form>
    </div>
  )
}
