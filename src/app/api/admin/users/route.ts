import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const query = searchParams.get('q')?.trim() ?? '';
  const pageSize = 15;

  const where: any = {};
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

  return NextResponse.json({
    data: users.map(u => ({ ...u, isSuperAdmin: u.id === firstAdmin?.id })),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { userId, action, role } = body;

  const firstAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });

  if (userId === firstAdmin?.id && (action === 'ban' || role === 'USER')) {
    return NextResponse.json({ error: 'SuperAdmin o\'zini bloklay olmaydi' }, { status: 400 });
  }

  const currentAdminId = firstAdmin?.id;

  try {
    if (action === 'ban') {
      await prisma.user.update({ where: { id: userId }, data: { isBanned: true } });
      if (currentAdminId) await logAdminAction({ adminId: currentAdminId, action: 'BAN_USER', targetId: userId });
    } else if (action === 'unban') {
      await prisma.user.update({ where: { id: userId }, data: { isBanned: false } });
      if (currentAdminId) await logAdminAction({ adminId: currentAdminId, action: 'UNBAN_USER', targetId: userId });
    } else if (role && (role === 'USER' || role === 'ADMIN')) {
      await prisma.user.update({ where: { id: userId }, data: { role } });
      if (currentAdminId) await logAdminAction({ adminId: currentAdminId, action: 'CHANGE_ROLE', targetId: userId, details: 'Yangi rol: ' + role });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Xatolik yuz berdi' }, { status: 500 });
  }
}