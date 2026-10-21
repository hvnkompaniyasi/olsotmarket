'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Home, User, Phone, Mail, Lock } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (!numbers.startsWith('998') && numbers.length > 0) {
      return '998' + numbers
    }
    return numbers
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || data.errors?.[0]?.message || 'Xatolik yuz berdi')
      } else {
        router.push('/login')
      }
    } catch (err) {
      setError('Xatolik yuz berdi')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    if (name === 'phone') {
      const formatted = formatPhone(value)
      if (formatted.length <= 12) {
        setFormData({ ...formData, [name]: formatted })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-300/40 to-emerald-400/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-300/40 to-emerald-400/40 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-200/20 to-emerald-200/20 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-lg bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-[28px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30 pointer-events-none" />
        
        <div className="relative p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-400 to-emerald-500 shadow-[0_8px_24px_rgba(10,124,78,0.35)] transform hover:scale-110 transition-transform duration-300">
              <Home className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-sm">
              Olsot Market
            </h1>
            <p className="text-gray-700 mt-1 text-base font-medium">Yangi akkaunt yarating</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-500/10 border border-red-400/30 text-red-700 px-4 py-2 rounded-xl text-sm backdrop-blur-sm shadow-inner">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-gray-800 font-semibold text-sm ml-1">Ism</Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors z-10" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ismingiz"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-11 h-12 bg-white/90 backdrop-blur-xl border-2 border-white/70 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-800 font-semibold text-sm ml-1">Email *</Label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors z-10" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="sizning@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className="pl-11 h-12 bg-white/90 backdrop-blur-xl border-2 border-white/70 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-gray-800 font-semibold text-sm ml-1">Telefon raqam (ixtiyoriy)</Label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors z-10" />
                <span className="absolute left-12 top-1/2 -translate-y-1/2 text-green-600 font-semibold select-none pointer-events-none z-20 text-base">
                  +998{' '}
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="90 123 45 67"
                  value={formData.phone.startsWith('998') ? formData.phone.slice(3) : formData.phone}
                  onChange={handleChange}
                  className="pl-[96px] h-12 bg-white/90 backdrop-blur-xl border-2 border-white/70 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 font-semibold text-base"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-800 font-semibold text-sm ml-1">Parol *</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors z-10" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-11 h-12 bg-white/90 backdrop-blur-xl border-2 border-white/70 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-gray-800 font-semibold text-sm ml-1">Parolni tasdiqlang *</Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors z-10" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-11 h-12 bg-white/90 backdrop-blur-xl border-2 border-white/70 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 font-medium"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-4 bg-gradient-to-r from-emerald-400 via-emerald-400 to-emerald-500 hover:from-green-500 hover:via-emerald-500 hover:to-green-600 text-white font-bold rounded-xl shadow-[0_8px_24px_rgba(10,124,78,0.35)] hover:shadow-[0_12px_32px_rgba(10,124,78,0.45)] transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Yaratilmoqda..." : "Royxatdan otish"}
            </Button>

            <div className="text-center mt-3">
              <p className="text-gray-700 text-sm">
                Akkaunt bormi?{" "}
                <Link href="/login" className="text-green-600 hover:text-green-700 font-bold underline decoration-emerald-400/50 decoration-2 underline-offset-4 transition-colors">
                  Kirish
                </Link>
              </p>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}