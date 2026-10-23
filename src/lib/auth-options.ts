import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import * as Sentry from "@sentry/nextjs"

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
      if (user) token.sub = user.id

      const email = typeof token.email === "string" ? token.email : null
      if (token.sub || email) {
        const dbUser = await prisma.user.findUnique({
          where: token.sub ? { id: token.sub } : { email: email! },
          select: { role: true, phone: true },
        })

        if (dbUser) {
          token.role = dbUser.role
          token.phone = dbUser.phone ?? undefined
        } else {
          delete token.role
          delete token.phone
          delete token.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub
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
