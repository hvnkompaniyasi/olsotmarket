'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, FileText, Users, Activity, LogOut, Menu, X, ArrowLeft
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

const menuItems = [
  { href: '/admin', label: 'Bosh sahifa', icon: LayoutDashboard },
  { href: '/admin/listings', label: "E'lonlar", icon: FileText },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  { href: '/admin/logs', label: 'Audit Loglar', icon: Activity },
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
  const { data: session } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const activeItem = menuItems.find(({ href }) => isActivePath(pathname, href));
  const title = activeItem?.label ?? 'Admin';
  
  // Foydalanuvchi ismining birinchi harfini olish
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() 
    ?? session?.user?.email?.charAt(0).toUpperCase() 
    ?? 'A';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors">
      {/* Mobil orqa fon */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Menyuni yopish"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-transform md:static md:z-auto md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo qismi */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-800 md:h-auto md:p-6">
          <div>
            <Link
              href="/admin"
              className="inline-flex min-w-0"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Olsot Market admin bosh sahifasi"
            >
              <Logo size="sm" />
            </Link>
            <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">Boshqaruv paneli</p>
          </div>
          <button 
            type="button" 
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menyu */}
        <nav aria-label="Admin menyusi" className="flex-1 space-y-1 p-3 md:p-4 overflow-y-auto">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const active = isActivePath(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#0A7C4E] text-white shadow-md shadow-green-500/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Pastki qism */}
        <div className="border-t border-gray-200 p-3 dark:border-zinc-800 md:p-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
            onClick={() => setIsSidebarOpen(false)}
          >
            <ArrowLeft className="h-4 w-4" />
            Asosiy saytga qaytish
          </Link>
        </div>
      </aside>

      {/* Asosiy qism */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Menyuni ochish"
              aria-expanded={isSidebarOpen}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-bold text-gray-900 dark:text-white md:text-lg">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Foydalanuvchi ma'lumotlari */}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {session?.user?.name || 'Admin'}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {session?.user?.email || session?.user?.phone || ''}
              </p>
            </div>
            
            {/* Avatar */}
            <div
              aria-label="Admin avatari"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0A7C4E] to-[#086339] text-sm font-bold text-white shadow-sm"
            >
              {userInitial}
            </div>

            {/* Chiqish tugmasi */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              aria-label="Tizimdan chiqish"
              title="Chiqish"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Sahifa kontenti */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}