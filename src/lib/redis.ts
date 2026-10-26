import Redis from "ioredis"

let redisClient: Redis | null = null
let redisErrorLoggedAt = 0
let redisConnectPromise: { client: Redis; promise: Promise<boolean> } | null = null

function logRedisError(operation: string, error: unknown) {
  const now = Date.now()
  if (now - redisErrorLoggedAt < 60_000) return
  redisErrorLoggedAt = now
  const details = error instanceof Error ? error.message : String(error)
  console.warn(`Redis ${operation} unavailable; continuing without cache.`, details)
}

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null
  if (redisClient && redisClient.status !== "end") return redisClient

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      connectTimeout: 1_000,
      commandTimeout: 1_500,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 250, 1_000)),
    })
    redisClient.on("error", (error) => logRedisError("connection", error))
    return redisClient
  } catch (error) {
    logRedisError("initialization", error)
    return null
  }
}

function waitForRedisReady(client: Redis): Promise<boolean> {
  if (client.status === "ready") return Promise.resolve(true)

  return new Promise((resolve) => {
    let settled = false
    const timeout = setTimeout(() => finish(false), 1_500)
    const finish = (ready: boolean) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      client.off("ready", onReady)
      client.off("error", onError)
      client.off("end", onEnd)
      resolve(ready)
    }
    const onReady = () => finish(true)
    const onError = (error: Error) => {
      logRedisError("connection", error)
      finish(false)
    }
    const onEnd = () => finish(false)

    client.once("ready", onReady)
    client.once("error", onError)
    client.once("end", onEnd)
    if (client.status === "ready") finish(true)
  })
}

async function ensureRedisReady(client: Redis): Promise<boolean> {
  if (client.status === "ready") return true
  if (redisConnectPromise?.client === client) return redisConnectPromise.promise

  const promise = (async () => {
    try {
      if (client.status === "wait") {
        await client.connect()
        return true
      }
      if (client.status === "connecting" || client.status === "reconnecting") {
        return await waitForRedisReady(client)
      }
      return false
    } catch (error) {
      logRedisError("connection", error)
      return false
    }
  })()

  redisConnectPromise = { client, promise }
  try {
    return await promise
  } finally {
    if (redisConnectPromise?.promise === promise) redisConnectPromise = null
  }
}

export async function checkRedisConnection(): Promise<void> {
  const client = getRedisClient()
  if (!client) {
    throw new Error("REDIS_URL is not configured")
  }

  if (!(await ensureRedisReady(client))) {
    throw new Error("Redis is not ready")
  }
  await client.ping()
}

export async function getRedisCache(key: string): Promise<string | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    if (!(await ensureRedisReady(client))) {
      logRedisError("read", new Error("Redis is not ready"))
      return null
    }
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
    if (!(await ensureRedisReady(client))) {
      logRedisError("write", new Error("Redis is not ready"))
      return
    }
    await client.set(key, value, "EX", ttlSeconds)
  } catch (error) {
    logRedisError("write", error)
  }
}

export async function invalidateRedisCache(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    if (!(await ensureRedisReady(client))) {
      logRedisError("invalidation", new Error("Redis is not ready"))
      return
    }
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
