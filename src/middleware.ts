import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Serverless cheklovi: in-memory Map har deploy'da tozalanadi.
const rateMap = new Map<string, { count: number; reset: number }>()

export async function middleware(req: NextRequest) {
  const method = req.method
  if (method !== "POST" && method !== "PATCH" && method !== "DELETE") {
    return NextResponse.next()
  }
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  const rec = rateMap.get(ip)

  if (!rec || now > rec.reset) {
    rateMap.set(ip, { count: 1, reset: now + 60_000 })
  } else {
    rec.count++
    if (rec.count > 60) {
      return NextResponse.json(
        { error: "Juda ko'p so'rov. Biroz kutib qayta urinib ko'ring." },
        { status: 429 }
      )
    }
  }
  if (rateMap.size > 10_000) rateMap.clear()
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}
