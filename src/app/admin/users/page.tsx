import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import UserActions from './UserActions';

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

  const firstAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });

  const usersWithSuper = users.map(u => ({ ...u, isSuperAdmin: u.id === firstAdmin?.id }));
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Foydalanuvchilarni boshqarish</h1>
      
      <form className="flex gap-2" action="/admin/users" method="get">
        <input name="q" defaultValue={query} placeholder="Ism, Email yoki Telefon..." className="border px-2 py-1 rounded" />
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition"
        >
          Qidirish
        </button>
      </form>

      <table className="w-full border text-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Foydalanuvchi</th>
            <th className="p-2 text-left">Rol</th>
            <th className="p-2 text-left">E&apos;lonlar</th>
            <th className="p-2 text-left">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {usersWithSuper.map((u) => (
            <tr key={u.id} className={'border-t ' + (u.isBanned ? 'bg-red-50' : '')}>
              <td className="p-2">
                <div className="font-medium">{u.name || 'Noma\'lum'}</div>
                <div className="text-xs text-gray-500">{u.email || u.phone || '—'}</div>
                {u.isBanned && <span className="text-xs text-red-600 font-bold">BANNED</span>}
              </td>
              <td className="p-2">
                <span className={'px-2 py-1 rounded text-xs ' + (u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100')}>
                  {u.role}
                </span>
              </td>
              <td className="p-2">{u._count.listings}</td>
              <td className="p-2"><UserActions user={u} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2">
        {page > 1 && <Link href={`/admin/users?page=${page - 1}&q=${query}`} className="underline">← Oldingi</Link>}
        <span>Sahifa {page} / {totalPages || 1}</span>
        {page < totalPages && <Link href={`/admin/users?page=${page + 1}&q=${query}`} className="underline">Keyingi →</Link>}
      </div>
    </div>
  );
}