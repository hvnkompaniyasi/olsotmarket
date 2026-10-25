'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';

const menuItems = [
  { href: '/admin', label: 'Bosh sahifa' },
  { href: '/admin/listings', label: "E'lonlar" },
  { href: '/admin/users', label: 'Foydalanuvchilar' },
  { href: '/admin/logs', label: 'Audit Loglar' },
];

function isActivePath(pathname: string, href: string) {
  return href === '/admin' ? pathname === href : pathname.startsWith(href);
}

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const title = menuItems.find(({ href }) => isActivePath(pathname, href))?.label ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform md:static md:z-auto md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-gray-200 p-6">
          <Link
            href="/admin"
            className="text-xl font-bold text-green-700"
            onClick={() => setIsSidebarOpen(false)}
          >
            Olsot Market
          </Link>
          <p className="mt-1 text-xs text-gray-500">Boshqaruv paneli</p>
        </div>

        <nav aria-label="Admin menyusi" className="flex-1 space-y-1 p-4">
          {menuItems.map(({ href, label }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setIsSidebarOpen(false)}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? 'bg-green-700 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <Link
            href="/"
            className="block rounded-xl px-4 py-3 text-sm text-gray-600 transition hover:bg-gray-100"
            onClick={() => setIsSidebarOpen(false)}
          >
            Asosiy saytga qaytish
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menyuni ochish"
              aria-expanded={isSidebarOpen}
              className="rounded-lg p-2 text-xl text-gray-700 hover:bg-gray-100 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>
          <div
            aria-label="Admin avatari"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white"
          >
            A
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
