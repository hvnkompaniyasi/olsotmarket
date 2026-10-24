import { cache } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

/**
 * Authoritative admin authorization for server components and layouts.
 *
 * getServerSession() runs the JWT callback, which reloads the role from the
 * database on every call, so a stale role inside the session cookie can never
 * grant or deny access here. React.cache() dedupes the lookup between a layout
 * and its page within a single request.
 */
export const requireAdmin = cache(async () => {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN"

  if (!session?.user?.id || !isAdmin) {
    redirect("/")
  }

  return session
})
