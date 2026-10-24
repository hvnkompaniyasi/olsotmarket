import type { NextAuthOptions } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import * as Sentry from "@sentry/nextjs"

const USER_SYNC_SELECT = { id: true, role: true, phone: true } as const

/**
 * Loads the current user record on every session read so role/phone changes
 * in the database are reflected immediately, even for an already-issued JWT.
 * Falls back to email lookup when the token id no longer exists (stale sub).
 */
async function loadUserForToken(token: JWT) {
  const userId =
    typeof token.sub === "string" ? token.sub : typeof token.id === "string" ? token.id : null
  const email = typeof token.email === "string" ? token.email.trim().toLowerCase() : null

  if (userId) {
    const byId = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SYNC_SELECT,
    })
    if (byId) return byId
  }

  if (email) {
    return prisma.user.findUnique({ where: { email }, select: USER_SYNC_SELECT })
  }

  return null
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email va parol kerak")
        }
        const email = credentials.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) throw new Error("Foydalanuvchi topilmadi")
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error("Parol noto'g'ri")
        return { id: user.id, email: user.email, phone: user.phone ?? undefined, name: user.name, role: user.role }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.id = user.id
      }

      // Always hit the DB: the JWT is only an identity hint, never the source of truth.
      const dbUser = await loadUserForToken(token)

      if (dbUser) {
        token.sub = dbUser.id
        token.id = dbUser.id
        token.role = dbUser.role
        token.phone = dbUser.phone ?? undefined
      } else {
        delete token.sub
        delete token.id
        delete token.role
        delete token.phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = token.sub ?? token.id
        if (userId) session.user.id = userId
        session.user.role = token.role ?? "USER"
        session.user.phone = token.phone
      }
      return session
    },
  },
  logger: {
    error(code, metadata) {
      const error = metadata instanceof Error ? metadata : metadata.error
      Sentry.withScope((scope) => {
        scope.setTag("subsystem", "nextauth")
        scope.setTag("nextauth.error_code", code)
        Sentry.captureException(error)
      })
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
