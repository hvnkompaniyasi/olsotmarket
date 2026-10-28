import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options'; // Auth sozlamalarini ulash
import * as Sentry from '@sentry/nextjs';
import { ListingStatus, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 15;

export async function GET(req: NextRequest) {
  try {
    // 1. XAVFSIZLIK: Faqat ADMIN rolidagi foydalanuvchilar kira oladi
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Ruxsat berilmagan' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const statusParam = searchParams.get('status') as ListingStatus | null;
    const query = searchParams.get('q')?.trim() ?? '';
    const sort = searchParams.get('sort') ?? 'newest';

    // 2. TIPLASHTIRISH: Prisma'ning aniq tiplaridan foydalanish
    const where: Prisma.ListingWhereInput = {};

    const allowedStatuses: ListingStatus[] = ['PENDING', 'ACTIVE', 'REJECTED'];
    if (statusParam && allowedStatuses.includes(statusParam)) {
      where.status = statusParam;
    }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { district: { contains: query, mode: 'insensitive' } },
        // Tavsifni qidiruvdan olib tashladik (admin panel tezligi uchun)
        { user: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' };

    // 3. OPTIMALLASHTIRISH: Faqat jadval uchun kerakli ustunlarni olamiz
    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          price: true,
          currency: true,
          status: true,
          createdAt: true,
          images: true, // Jadvalda kichik rasm ko'rsatish uchun
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return NextResponse.json({
      data: listings,
      meta: { page, pageSize: PAGE_SIZE, total, totalPages },
    });
  } catch (error) {
    // 4. XATONI SENTRY'GA YUBORISH
    Sentry.captureException(error);
    console.error('GET /api/admin/listings xatosi:', error);
    
    return NextResponse.json(
      { error: 'E\'lonlarni yuklab bo\'lmadi' }, 
      { status: 500 }
    );
  }
}