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
        email: { label: "Email", type: "email" },
        code: { label: "Tasdiqlash kodi", type: "text" },
        name: { label: "Ism", type: "text" },
      },
      async authorize(credentials) {
        const rawPhone = typeof credentials?.phone === "string" ? credentials.phone.trim() : ""
        const rawEmail = typeof credentials?.email === "string"
          ? credentials.email.trim().toLowerCase()
          : ""
        const phone = rawPhone ? normalizeUzbekPhone(rawPhone) : null
        const email = rawEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : null
        const code = typeof credentials?.code === "string" ? credentials.code : ""
        if (Boolean(rawPhone) === Boolean(rawEmail) || (!phone && !email) || !/^\d{4}$/.test(code)) {
          throw new Error("Telefon raqam, email yoki kod noto'g'ri")
        }

        const redis = getRedisClient()
        if (!redis) throw new Error("OTP xizmati hozircha ishlamayapti")
        if (redis.status === "wait") await redis.connect()
        if (redis.status !== "ready") throw new Error("OTP xizmati hozircha ishlamayapti")

        const otpKey = phone ? `otp:${phone}` : `otp:email:${email}`
        const storedCode = await redis.get(otpKey)
        if (storedCode !== code) throw new Error("Tasdiqlash kodi noto'g'ri yoki muddati tugagan")

        await redis.del(otpKey)

        let user = phone
          ? await prisma.user.findUnique({ where: { phone } })
          : await prisma.user.findUnique({ where: { email: email! } })
        if (!user) {
          const suppliedName = typeof credentials?.name === "string" ? credentials.name.trim() : ""
          try {
            user = await prisma.user.create({
              data: phone
                ? { name: suppliedName || "Foydalanuvchi", phone }
                : { name: suppliedName || "Foydalanuvchi", email: email! },
            })
          } catch {
            user = phone
              ? await prisma.user.findUnique({ where: { phone } })
              : await prisma.user.findUnique({ where: { email: email! } })
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