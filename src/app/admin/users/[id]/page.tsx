import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, Phone, Mail, Shield, Calendar, Home, Edit, Trash2 } from "lucide-react"
import { updateUserAction, deleteUserAction } from "../actions"

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { listings: { orderBy: { createdAt: "desc" }, take: 10 } },
  })

  if (!user) notFound()

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <Link href="/admin/users" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Foydalanuvchi profili</h1>
          <p className="text-sm text-gray-500">ID: {user.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Chap taraf: Profil va Tahrirlash */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-12 w-12" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{user.name || "Noma'lum"}</h2>
            <p className="text-sm text-gray-500 mt-1">{user.role}</p>
            
            <div className="w-full mt-6 space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" /> {user.phone || "Kiritilmagan"}
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" /> {user.email || "Kiritilmagan"}
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                <Calendar className="h-4 w-4 text-emerald-500 shrink-0" /> {new Date(user.createdAt).toLocaleDateString("uz-UZ")}
              </div>
            </div>
          </div>

          {/* Tahrirlash Formasi */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Edit className="h-4 w-4" /> Tahrirlash</h3>
            <form action={async (formData) => { "use server"; await updateUserAction(user.id, formData) }} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Ism</label>
                <input name="name" defaultValue={user.name || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Telefon</label>
                <input name="phone" defaultValue={user.phone || ""} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Rol</label>
                <select name="role" defaultValue={user.role} className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition-colors">Saqlash</button>
            </form>
          </div>

          {/* O'chirish */}
          <form action={async () => { "use server"; await deleteUserAction(user.id) }}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3 rounded-xl transition-colors">
              <Trash2 className="h-4 w-4" /> Hisobni o'chirish
            </button>
          </form>
        </div>

        {/* O'ng taraf: E'lonlari */}
        <div className="md:col-span-2">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Home className="h-4 w-4 text-emerald-500" /> Foydalanuvchi e'lonlari ({user.listings.length})</h3>
            
            <div className="space-y-3">
              {user.listings.map(l => (
                <Link key={l.id} href={`/admin/listings/${l.id}`} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors group">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate group-hover:text-emerald-700">{l.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Intl.NumberFormat("uz-UZ").format(l.price)} {l.currency === "USD" ? "$" : "so'm"}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{l.status}</span>
                </Link>
              ))}
              {user.listings.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">Bu foydalanuvchining e'lonlari yo'q</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
