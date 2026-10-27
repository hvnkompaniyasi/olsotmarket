import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { getRedisClient } from "@/lib/redis"
import { normalizeUzbekPhone } from "@/lib/phone"
import * as Sentry from "@sentry/nextjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Telefon raqam", type: "tel" },
        code: { label: "SMS kod", type: "text" },
        name: { label: "Ism", type: "text" },
      },
      async authorize(credentials) {
        const phone = typeof credentials?.phone === "string"
          ? normalizeUzbekPhone(credentials.phone)
          : null
        const code = typeof credentials?.code === "string" ? credentials.code : ""
        if (!phone || !/^\d{4}$/.test(code)) throw new Error("Telefon raqam yoki kod noto'g'ri")

        const redis = getRedisClient()
        if (!redis) throw new Error("OTP xizmati hozircha ishlamayapti")
        if (redis.status === "wait") await redis.connect()
        if (redis.status !== "ready") throw new Error("OTP xizmati hozircha ishlamayapti")

        const storedCode = await redis.get(`otp:${phone}`)
        if (storedCode !== code) throw new Error("Tasdiqlash kodi noto'g'ri yoki muddati tugagan")

        await redis.del(`otp:${phone}`)

        let user = await prisma.user.findUnique({ where: { phone } })
        if (!user) {
          const suppliedName = typeof credentials?.name === "string" ? credentials.name.trim() : ""
          try {
            user = await prisma.user.create({
              data: { name: suppliedName || "Foydalanuvchi", phone },
            })
          } catch {
            user = await prisma.user.findUnique({ where: { phone } })
            if (!user) throw new Error("Foydalanuvchi yaratilmadi")
          }
        }

        return { id: user.id, email: user.email, phone: user.phone ?? undefined, name: user.name, role: user.role }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = token.sub ?? token.id
        if (userId) session.user.id = userId
        session.user.phone = typeof token.phone === "string" ? token.phone : undefined
        session.user.role = typeof token.role === "string" ? token.role : "USER"
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