import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = req.nextUrl.clone()
  url.pathname = `/listing/${encodeURIComponent(params.id)}`
  return NextResponse.redirect(url, 308)
}
