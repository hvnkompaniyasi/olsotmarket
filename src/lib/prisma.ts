import { PrismaClient } from "@prisma/client"

// Next.js dev mode'da hot-reload paytida bir nechta PrismaClient
// yaratilishini oldini olish uchun global singleton pattern
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL topilmadi. .env faylida DATABASE_URL (va DIRECT_URL) " +
        "sozlanganini tekshiring."
    )
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
