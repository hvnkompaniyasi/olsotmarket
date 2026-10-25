import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ListingStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 15;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const statusParam = searchParams.get('status') as ListingStatus | null;
    const query = searchParams.get('q')?.trim() ?? '';
    const sort = searchParams.get('sort') ?? 'newest';

    const where: Record<string, unknown> = {};

    const allowedStatuses: ListingStatus[] = ['PENDING', 'ACTIVE', 'REJECTED'];
    if (statusParam && allowedStatuses.includes(statusParam)) {
      where.status = statusParam;
    }

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

    return NextResponse.json({
      data: listings,
      meta: { page, pageSize: PAGE_SIZE, total, totalPages },
    });
  } catch (error) {
    console.error('GET /api/admin/listings error:', error);
    return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
  }
}
