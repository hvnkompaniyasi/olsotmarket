import { prisma } from '@/lib/prisma';

export async function logAdminAction(data: {
  adminId: string;
  action: string;
  targetId?: string;
  details?: string;
}) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId: data.adminId,
        action: data.action,
        targetId: data.targetId,
        details: data.details,
      },
    });
  } catch (error) {
    console.error('Audit log xatosi:', error);
  }
}