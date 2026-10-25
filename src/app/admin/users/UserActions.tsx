'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Prisma } from '@prisma/client';

type UserWithListingCount = Prisma.UserGetPayload<{
  include: { _count: { select: { listings: true } } };
}> & { isSuperAdmin: boolean };

export default function UserActions({ user }: { user: UserWithListingCount }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: string, role?: string) => {
    setLoading(true);
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, action, role }),
    });
    setLoading(false);
    router.refresh();
  };

  if (user.isSuperAdmin) {
    return <span className="text-xs text-purple-600 font-bold">SUPERADMIN</span>;
  }

  return (
    <div className="flex gap-1 items-center">
      <select
        className="border rounded p-0.5 text-xs max-w-[70px]"
        value={user.role}
        onChange={(e) => handleAction('role', e.target.value)}
        disabled={loading}
      >
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button
        onClick={() => handleAction(user.isBanned ? 'unban' : 'ban')}
        disabled={loading}
        className={`rounded-lg px-3 py-1 text-xs text-white transition ${
          user.isBanned
            ? 'bg-green-700 hover:bg-green-800'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {user.isBanned ? 'Unban' : 'Ban'}
      </button>
    </div>
  );
}