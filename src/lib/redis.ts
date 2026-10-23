import Redis from "ioredis"

let redisClient: Redis | null = null
let redisErrorLoggedAt = 0

function logRedisError(operation: string, error: unknown) {
  const now = Date.now()
  if (now - redisErrorLoggedAt < 60_000) return
  redisErrorLoggedAt = now
  console.error(`Redis ${operation} failed:`, error)
}

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (redisClient) return redisClient

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 1_000,
      commandTimeout: 1_500,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 100, 1_000),
    })
    redisClient.on("error", (error) => logRedisError("connection", error))
    return redisClient
  } catch (error) {
    logRedisError("initialization", error)
    return null
  }
}

export async function getRedisCache(key: string): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    return await client.get(key)
  } catch (error) {
    logRedisError("read", error)
    return null
  }
}

export async function setRedisCache(key: string, value: string, ttlSeconds: number): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.set(key, value, "EX", ttlSeconds)
  } catch (error) {
    logRedisError("write", error)
  }
}

export async function invalidateRedisCache(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    let cursor = "0"
    do {
      const [nextCursor, keys] = await client.scan(cursor, "MATCH", pattern, "COUNT", 100)
      cursor = nextCursor
      if (keys.length > 0) await client.del(...keys)
    } while (cursor !== "0")
  } catch (error) {
    logRedisError("invalidation", error)
  }
}
