import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle, Edit, Phone, MapPin, User, Home, BedDouble, Ruler, Calendar, Armchair } from "lucide-react"
import { updateListingStatus } from "../actions"
import ImageGallery from "@/components/ImageGallery"

export default async function AdminListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  })

  if (!listing) notFound()

  const isPending = listing.status === "PENDING"

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header va Tugmalar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <Link href="/admin/listings" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">E'lonni ko'rib chiqish</h1>
            <p className="text-sm text-gray-500">ID: {listing.id}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link
            href={`/admin/listings/${listing.id}/edit`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl transition-colors"
          >
            <Edit className="h-4 w-4" /> Tahrirlash
          </Link>

          {isPending && (
            <>
              <form action={async () => { "use server"; await updateListingStatus(listing.id, "REJECTED") }} className="flex-1 sm:flex-none">
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors">
                  <XCircle className="h-4 w-4" /> Rad etish
                </button>
              </form>
              
              <form action={async () => { "use server"; await updateListingStatus(listing.id, "ACTIVE") }} className="flex-1 sm:flex-none">
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 font-bold rounded-xl transition-colors">
                  <CheckCircle className="h-4 w-4" /> Tasdiqlash
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chap taraf: Rasmlar va Tavsif */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Asosiy ma'lumotlar</h2>
            
            <ImageGallery images={listing.images} />

            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">{listing.title}</h3>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {new Intl.NumberFormat("uz-UZ").format(listing.price)} {listing.currency === "USD" ? "$" : "so'm"}
              </p>
            </div>

            <div className="flex items-start gap-2 text-gray-600">
              <MapPin className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p>{listing.region}, {listing.district}, {listing.address}</p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-gray-800 mb-2">Tavsif</h4>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>
        </div>

        {/* O'ng taraf: Xususiyatlar va Foydalanuvchi */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Xususiyatlar</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-gray-700">
              <div className="flex items-center gap-2"><Home className="h-4 w-4 text-emerald-500" /> {listing.category}</div>
              <div className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-emerald-500" /> {listing.rooms || '—'} xona</div>
              <div className="flex items-center gap-2"><Ruler className="h-4 w-4 text-emerald-500" /> {listing.area || '—'} m²</div>
              <div className="flex items-center gap-2"><Armchair className="h-4 w-4 text-emerald-500" /> Jixoz: {listing.furniture ? "Bor" : "Yo'q"}</div>
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-500" /> {listing.floor || '—'}/{listing.totalFloors || '—'} qavat</div>
            </div>
            
            <h4 className="font-semibold text-gray-800 pt-2 border-t">Kommunal xizmatlar</h4>
            <div className="flex flex-wrap gap-2">
              {listing.hasGas && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">Gaz</span>}
              {listing.hasWater && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">Suv</span>}
              {listing.hasElectricity && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">Svet</span>}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Sotuvchi</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-bold text-gray-800">{listing.user.name || "Noma'lum"}</p>
                <p className="text-xs text-gray-500">{listing.user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 p-3 rounded-xl">
              <Phone className="h-4 w-4" /> {listing.user.phone || "Telefon kiritilmagan"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
