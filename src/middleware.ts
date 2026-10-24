import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Serverless cheklovi: in-memory Map har deploy'da tozalanadi.
const rateMap = new Map<string, { count: number; reset: number }>()

function isAdminApi(pathname: string): boolean {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/")
}

function isAdminPage(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/edits" ||
    pathname.startsWith("/edits/") ||
    pathname === "/stats" ||
    pathname.startsWith("/stats/")
  )
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const adminApi = isAdminApi(pathname)
  const adminPage = isAdminPage(pathname)

  if (adminApi || adminPage) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const userId = token?.sub ?? token?.id

    // Coarse gate only: is there an authenticated session at all?
    // The JWT role is NOT trusted here. Middleware runs on the Edge runtime,
    // which cannot use Prisma, so the authoritative role is read from the
    // database by requireAdmin() in the admin layouts/pages and by
    // getServerSession() inside every /api/admin route handler.
    if (!userId) {
      if (adminApi) {
        return NextResponse.json(
          { success: false, error: "Ruxsat yo'q", code: "FORBIDDEN" },
          { status: 403 }
        )
      }

      const home = req.nextUrl.clone()
      home.pathname = "/"
      home.search = ""
      return NextResponse.redirect(home)
    }
  }

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
  matcher: ["/api/:path*", "/admin", "/admin/:path*", "/edits", "/edits/:path*", "/stats", "/stats/:path*"],
}
