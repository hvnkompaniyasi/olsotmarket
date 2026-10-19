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
    const { name, phone, email, password } = result.data

    if (!phone || !password) {
      return NextResponse.json({ error: 'Telefon va parol majburiy' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '')

    const existingUser = await prisma.user.findUnique({ where: { phone: cleanPhone } })
    if (existingUser) {
      return NextResponse.json({ error: 'Bu telefon raqam allaqachon ro\'yxatdan o\'tgan' }, { status: 400 })
    }

    // OPTIMIZATSIYA: 10 rounds (tezroq)
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name || null,
        phone: cleanPhone,
        email: email || null,
        password: hashedPassword,
      },
    })

    return NextResponse.json({ 
      message: 'Muvaffaqiyatli', 
      user: { id: user.id, phone: user.phone } 
    }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}