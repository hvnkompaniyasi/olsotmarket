import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import UserActions from './UserActions';
import { Eye, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';
type SearchParams = { page?: string; q?: string };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const query = params.q?.trim() ?? '';
  const pageSize = 15;

  const where: Prisma.UserWhereInput = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query, mode: 'insensitive' } },
    ];
  }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { _count: { select: { listings: true } } },
    }),
  ]);

  const firstAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' }, select: { id: true } });
  const usersWithSuper = users.map(u => ({ ...u, isSuperAdmin: u.id === firstAdmin?.id }));
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Foydalanuvchilarni boshqarish</h1>

      <form className="flex gap-2 max-w-md" action="/admin/users" method="get">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input name="q" defaultValue={query} placeholder="Ism, Email yoki Telefon..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>
        <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">Qidirish</button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Foydalanuvchi</th>
              <th className="p-4 font-semibold text-gray-600">Rol</th>
              <th className="p-4 font-semibold text-gray-600">E'lonlar</th>
              <th className="p-4 font-semibold text-gray-600">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usersWithSuper.map((u) => (
              <tr key={u.id} className={'hover:bg-gray-50 transition-colors ' + (u.isBanned ? 'bg-red-50/50' : '')}>
                <td className="p-4">
                  <div className="font-medium text-gray-800">{u.name || 'Noma\'lum'}</div>
                  <div className="text-xs text-gray-500">{u.phone || u.email || '—'}</div>
                  {u.isBanned && <span className="text-[10px] text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded mt-1 inline-block">BANNED</span>}
                </td>
                <td className="p-4">
                  <span className={'px-2 py-1 rounded text-xs font-bold ' + (u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600')}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-gray-600">{u._count.listings}</td>
                <td className="p-4 flex items-center gap-3">
                  <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors">
                    <Eye className="h-3.5 w-3.5" /> Batafsil
                  </Link>
                  <UserActions user={u} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100">
        <span className="text-sm text-gray-500">Jami: {total} ta foydalanuvchi</span>
        <div className="flex items-center gap-2">
          {page > 1 && <Link href={`/admin/users?page=${page - 1}&q=${query}`} className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">← Oldingi</Link>}
          <span className="text-sm font-medium text-gray-700">Sahifa {page} / {totalPages || 1}</span>
          {page < totalPages && <Link href={`/admin/users?page=${page + 1}&q=${query}`} className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Keyingi →</Link>}
        </div>
      </div>
    </div>
  );
}
