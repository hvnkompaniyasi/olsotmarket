import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRedisConnection } from "@/lib/redis"

export const dynamic = "force-dynamic"

async function withTimeout(check: () => Promise<void>, timeoutMs: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("Health check timed out")), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function checkPostgres(): Promise<boolean> {
  try {
    await withTimeout(() => prisma.$queryRaw`SELECT 1`.then(() => undefined), 5_000)
    return true
  } catch (error) {
    console.error("Health check PostgreSQL failed:", error)
    return false
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    await withTimeout(checkRedisConnection, 5_000)
    return true
  } catch (error) {
    console.error("Health check Redis failed:", error)
    return false
  }
}

export async function GET() {
  const [postgres, redis] = await Promise.all([checkPostgres(), checkRedis()])
  const timestamp = new Date().toISOString()

  if (!postgres || !redis) {
    return NextResponse.json(
      {
        status: "error",
        timestamp,
        checks: { postgres: postgres ? "ok" : "error", redis: redis ? "ok" : "error" },
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }

  return NextResponse.json(
    { status: "ok", timestamp },
    { headers: { "Cache-Control": "no-store" } }
  )
}
