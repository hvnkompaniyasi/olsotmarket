import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const numberFormatter = new Intl.NumberFormat('uz-UZ');
const dateFormatter = new Intl.DateTimeFormat('uz-UZ', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statCards = [
  { label: 'Jami e’lonlar', color: 'bg-blue-50 text-blue-700' },
  { label: 'Kutilayotgan', color: 'bg-amber-50 text-amber-700' },
  { label: 'Faol e’lonlar', color: 'bg-green-50 text-green-700' },
  { label: 'Foydalanuvchilar', color: 'bg-purple-50 text-purple-700' },
  { label: 'Bloklanganlar', color: 'bg-red-50 text-red-700' },
  { label: 'Bugungi e’lonlar', color: 'bg-cyan-50 text-cyan-700' },
];

const quickLinks = [
  { href: '/admin/listings?status=PENDING', label: 'Moderatsiya' },
  { href: '/admin/users', label: 'Foydalanuvchilar' },
  { href: '/admin/logs', label: 'Audit Loglar' },
];

export default async function AdminDashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalListings,
    pendingListingsCount,
    activeListings,
    totalUsers,
    bannedUsers,
    todayListings,
    pendingListings,
    recentLogs,
  ] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'PENDING' } }),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.listing.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.listing.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, region: true, createdAt: true },
    }),
    prisma.adminLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { admin: { select: { name: true, email: true } } },
    }),
  ]);

  const statValues = [
    totalListings,
    pendingListingsCount,
    activeListings,
    totalUsers,
    bannedUsers,
    todayListings,
  ];

  return (
    <div className="space-y-6">
      <section
        aria-label="Asosiy statistika"
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
      >
        {statCards.map(({ label, color }, index) => (
          <article key={label} className={`rounded-xl border border-gray-200 p-4 ${color}`}>
            <p className="text-sm">{label}</p>
            <p className="mt-2 text-2xl font-bold">{numberFormatter.format(statValues[index])}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">So’nggi kutilayotgan e’lonlar</h2>
            <Link href="/admin/listings?status=PENDING" className="text-sm text-green-700 hover:underline">
              Barchasi
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-left text-gray-600">
                <tr>
                  <th className="p-3 font-medium">Sarlavha</th>
                  <th className="p-3 font-medium">Hudud</th>
                  <th className="p-3 font-medium">Sana</th>
                </tr>
              </thead>
              <tbody>
                {pendingListings.map((listing) => (
                  <tr key={listing.id} className="border-t border-gray-100">
                    <td className="max-w-48 truncate p-3 font-medium text-gray-900">
                      {listing.title || '—'}
                    </td>
                    <td className="p-3 text-gray-600">{listing.region}</td>
                    <td className="whitespace-nowrap p-3 text-gray-600">
                      {dateFormatter.format(listing.createdAt)}
                    </td>
                  </tr>
                ))}
                {pendingListings.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      Kutilayotgan e’lonlar yo’q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">So’nggi audit loglar</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{log.action}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {log.admin.name || log.admin.email || 'Noma’lum admin'}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-gray-500">
                  {dateFormatter.format(log.createdAt)}
                </time>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-500">Audit loglar mavjud emas</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-4 font-semibold text-gray-900">Tezkor havolalar</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
