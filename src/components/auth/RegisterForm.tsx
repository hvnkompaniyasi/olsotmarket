'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RegistrationData = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type RegistrationResponse = {
  error?: string;
  errors?: Array<{ message?: string }>;
};

const inputClass =
  'h-12 bg-white/90 border-2 border-white/70 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] font-medium';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      const phone = digits && !digits.startsWith('998') ? `998${digits}` : digits;
      if (phone.length <= 12) setFormData((current) => ({ ...current, phone }));
      return;
    }
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Parollar mos kelmaydi');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone || undefined,
          password: formData.password,
        }),
      });
      const result = (await response.json()) as RegistrationResponse;

      if (!response.ok) {
        setError(result.error || result.errors?.[0]?.message || 'Xatolik yuz berdi');
      } else {
        router.push('/login');
      }
    } catch {
      setError('Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div role="alert" className="bg-red-500/10 border border-red-400/30 text-red-700 px-4 py-2 rounded-xl text-sm">
          {error}
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-gray-800 font-semibold text-sm ml-1">Ism</Label>
        <div className="relative">
          <User aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input id="name" name="name" placeholder="Ismingiz" value={formData.name} onChange={handleChange} className={`pl-11 ${inputClass}`} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-gray-800 font-semibold text-sm ml-1">Email *</Label>
        <div className="relative">
          <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input id="email" name="email" type="email" placeholder="sizning@email.com" value={formData.email} onChange={handleChange} required autoComplete="email" className={`pl-11 ${inputClass}`} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-gray-800 font-semibold text-sm ml-1">Telefon raqam (ixtiyoriy)</Label>
        <div className="relative">
          <Phone aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <span className="absolute left-12 top-1/2 -translate-y-1/2 text-green-600 font-semibold pointer-events-none">+998</span>
          <Input id="phone" name="phone" type="tel" placeholder="90 123 45 67" value={formData.phone.startsWith('998') ? formData.phone.slice(3) : formData.phone} onChange={handleChange} className={`pl-[96px] ${inputClass}`} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-gray-800 font-semibold text-sm ml-1">Parol *</Label>
        <div className="relative">
          <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required autoComplete="new-password" className={`pl-11 ${inputClass}`} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-gray-800 font-semibold text-sm ml-1">Parolni tasdiqlang *</Label>
        <div className="relative">
          <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" className={`pl-11 ${inputClass}`} />
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full h-12 mt-4 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl disabled:opacity-50">
        {loading ? 'Yaratilmoqda...' : "Ro'yxatdan o'tish"}
      </Button>
    </form>
  );
}
