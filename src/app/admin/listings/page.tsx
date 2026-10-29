import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { Search, Eye } from 'lucide-react';

const PAGE_SIZE = 15;

type SearchParams = { page?: string; status?: string; q?: string; sort?: string };

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const allowedStatuses = ['PENDING', 'ACTIVE', 'REJECTED'] as const;
  const status = allowedStatuses.find((candidate) => candidate === params.status);
  const query = params.q?.trim() ?? '';
  const sort = params.sort ?? 'newest';

  const where: Prisma.ListingWhereInput = {};
  if (status) where.status = status;
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { district: { contains: query, mode: 'insensitive' } },
    ];
  }

  const orderBy = sort === 'oldest' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const };

  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (status) sp.set('status', status);
    if (query) sp.set('q', query);
    if (sort !== 'newest') sp.set('sort', sort);
    sp.set('page', String(page));
    Object.entries(overrides).forEach(([k, v]) => { if (v) sp.set(k, v); else sp.delete(k); });
    return `/admin/listings?${sp.toString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">KUTILMOQDA</span>;
      case 'ACTIVE': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">FAOL</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">RAD ETILGAN</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">E’lonlar moderatsiyasi</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'ALL', label: 'Barchasi' },
          { id: 'PENDING', label: 'Kutilmoqda' },
          { id: 'ACTIVE', label: 'Faol' },
          { id: 'REJECTED', label: 'Rad etilgan' },
        ].map((tab) => (
          <Link
            key={tab.id}
            href={buildUrl({ status: tab.id === 'ALL' ? undefined : tab.id, page: '1' })}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              (tab.id === 'ALL' && !status) || status === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form className="flex gap-2 max-w-md" action="/admin/listings" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Qidiruv..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
        </div>
        <select name="sort" defaultValue={sort} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
          <option value="newest">Yangi birinchi</option>
          <option value="oldest">Eski birinchi</option>
        </select>
        <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
          Filtrlash
        </button>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Sarlavha</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Sana</th>
              <th className="p-4 font-semibold text-gray-600">Foydalanuvchi</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {listings.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">E’lonlar topilmadi</td></tr>
            )}
            {listings.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors group">
                <td className="p-4 font-medium text-gray-800 max-w-[200px] truncate">
                  <Link href={`/admin/listings/${l.id}`} className="hover:text-emerald-600">
                    {l.title || 'Nomsiz'}
                  </Link>
                </td>
                <td className="p-4">{getStatusBadge(l.status)}</td>
                <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString('uz-UZ')}</td>
                <td className="p-4 text-gray-600 truncate max-w-[150px]">{l.user?.name ?? l.user?.email ?? '—'}</td>
                <td className="p-4 text-right">
                  <Link 
                    href={`/admin/listings/${l.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ko'rish
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100">
        <span className="text-sm text-gray-500">Jami: {total} ta e'lon</span>
        <div className="flex items-center gap-2">
          {page > 1 && <Link href={buildUrl({ page: String(page - 1) })} className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">← Oldingi</Link>}
          <span className="text-sm font-medium text-gray-700">Sahifa {page} / {totalPages || 1}</span>
          {page < totalPages && <Link href={buildUrl({ page: String(page + 1) })} className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">Keyingi →</Link>}
        </div>
      </div>
    </div>
  );
}
