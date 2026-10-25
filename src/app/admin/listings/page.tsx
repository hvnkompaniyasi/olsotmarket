import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

const PAGE_SIZE = 15;

type SearchParams = {
  page?: string;
  status?: string;
  q?: string;
  sort?: string;
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
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

  const orderBy =
    sort === 'oldest'
      ? { createdAt: 'asc' as const }
      : { createdAt: 'desc' as const };

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
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return `/admin/listings?${sp.toString()}`;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">E’lonlar moderatsiyasi</h1>

      <div className="flex gap-2 flex-wrap">
        {(['ALL', 'PENDING', 'ACTIVE', 'REJECTED'] as const).map((s) => (
          <Link
            key={s}
            href={buildUrl({ status: s === 'ALL' ? undefined : s, page: '1' })}
            className={`px-3 py-1 rounded ${
              (s === 'ALL' && !status) || status === s
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <form className="flex gap-2" action="/admin/listings" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          name="q"
          defaultValue={query}
          placeholder="Qidiruv..."
          className="border px-2 py-1 rounded"
        />
        <select name="sort" defaultValue={sort} className="border rounded">
          <option value="newest">Yangi birinchi</option>
          <option value="oldest">Eski birinchi</option>
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
            <th className="p-2 text-left">Sarlavha</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Sana</th>
            <th className="p-2 text-left">Foydalanuvchi</th>
          </tr>
        </thead>
        <tbody>
          {listings.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                E’lonlar topilmadi
              </td>
            </tr>
          )}
          {listings.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-2">{l.title || '—'}</td>
              <td className="p-2">{l.status}</td>
              <td className="p-2">{new Date(l.createdAt).toLocaleDateString()}</td>
              <td className="p-2">{l.user?.name ?? l.user?.email ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2">
        {page > 1 && (
          <Link href={buildUrl({ page: String(page - 1) })} className="underline">
            ← Oldingi
          </Link>
        )}
        <span>
          Sahifa {page} / {totalPages || 1}
        </span>
        {page < totalPages && (
          <Link href={buildUrl({ page: String(page + 1) })} className="underline">
            Keyingi →
          </Link>
        )}
      </div>
    </div>
  );
}