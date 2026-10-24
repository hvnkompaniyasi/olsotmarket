import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { RegisterSchema } from '@/lib/schemas'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = RegisterSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ errors: result.error.issues }, { status: 400 })
    }
    const { name, email, phone, password } = result.data

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' }, { status: 400 })
    }

    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : null
    if (cleanPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: cleanPhone } })
      if (existingPhone) {
        return NextResponse.json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' }, { status: 400 })
      }
    }

    // OPTIMIZATSIYA: 10 rounds (tezroq)
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        phone: cleanPhone,
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      message: 'Muvaffaqiyatli',
      user: { id: user.id, email: user.email },
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
