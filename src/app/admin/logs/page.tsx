import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ page?: string; adminId?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const adminId = params.adminId;
  const pageSize = 15;

  const where: Prisma.AdminLogWhereInput = {};
  if (adminId) where.adminId = adminId;

  const [total, logs] = await Promise.all([
    prisma.adminLog.count({ where }),
    prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { admin: { select: { name: true, email: true } } },
    }),
  ]);

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true, name: true, email: true } });
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Loglari</h1>
      
      <form className="flex gap-2" action="/admin/logs" method="get">
        <select name="adminId" defaultValue={adminId ?? ''} className="border rounded px-2 py-1">
          <option value="">Barcha adminlar</option>
          {admins.map(a => <option key={a.id} value={a.id}>{a.name || a.email}</option>)}
        </select>
        <button
          type="submit"
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition"
        >
          Filtrlash
        </button>
      </form>

      <table className="w-full border text-sm rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Admin</th>
            <th className="p-2 text-left">Harakat</th>
            <th className="p-2 text-left">Tafsilot</th>
            <th className="p-2 text-left">Sana</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.admin.name || l.admin.email}</td>
              <td className="p-2 font-semibold">{l.action}</td>
              <td className="p-2 text-xs">{l.details || '—'}</td>
              <td className="p-2">{new Date(l.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2">
        {page > 1 && <Link href={`/admin/logs?page=${page - 1}&adminId=${adminId || ''}`} className="underline">← Oldingi</Link>}
        <span>Sahifa {page} / {totalPages || 1}</span>
        {page < totalPages && <Link href={`/admin/logs?page=${page + 1}&adminId=${adminId || ''}`} className="underline">Keyingi →</Link>}
      </div>
    </div>
  );
}