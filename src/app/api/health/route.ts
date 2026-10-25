import Redis from "ioredis"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const errors: string[] = []

  const dbCheck = async (): Promise<boolean> => {
    try {
      await prisma.$queryRaw`SELECT 1`
      return true
    } catch {
      errors.push("Database check failed")
      return false
    }
  }

  const redisUrl = process.env.REDIS_URL
  const redisCheck = async (): Promise<boolean> => {
    if (!redisUrl) {
      errors.push("REDIS_URL is not configured")
      return false
    }

    let client: Redis | undefined
    try {
      client = new Redis(redisUrl, {
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 5_000,
        retryStrategy: () => null,
        tls: redisUrl.startsWith("rediss://") ? {} : undefined,
        lazyConnect: true,
      })

      await client.connect()
      await client.ping()
      return true
    } catch (error: any) {
      errors.push(`Redis check failed: ${error.message || "unknown error"}`)
      return false
    } finally {
      client?.disconnect()
    }
  }

  const [dbOk, redisOk] = await Promise.all([dbCheck(), redisCheck()])
  const timestamp = new Date().toISOString()
  const healthy = dbOk && redisOk

  return Response.json(
    healthy
      ? { status: "healthy", db: "ok", redis: "ok", timestamp }
      : {
          status: "unhealthy",
          db: dbOk ? "ok" : "error",
          redis: redisOk ? "ok" : "error",
          errors,
          timestamp,
        },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  )
}