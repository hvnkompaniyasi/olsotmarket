import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Telefon", type: "tel" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Telefon va parol kerak")
        }
        const rawPhone = credentials.phone.replace(/[^0-9]/g, "")
        const cleanPhone = rawPhone.startsWith("998") ? rawPhone : "998" + rawPhone
        const user = await prisma.user.findUnique({ where: { phone: cleanPhone } })
        if (!user || !user.password) throw new Error("Foydalanuvchi topilmadi")
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) throw new Error("Parol noto'g'ri")
        return { id: user.id, phone: user.phone, name: user.name, role: user.role }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.role = user.role; token.phone = user.phone }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.phone = token.phone as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
