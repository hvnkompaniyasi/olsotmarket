'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const inputClass =
  'pl-11 h-12 bg-white/90 border-2 border-white/70 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-green-400 focus:ring-4 focus:ring-green-400/20 shadow-[0_4px_16px_rgba(0,0,0,0.08)] font-medium';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    try {
      const result = await signIn('credentials', {
        email: String(formData.get('email')).trim().toLowerCase(),
        password: String(formData.get('password')),
        redirect: false,
      });

      if (result?.error) {
        setError("Email yoki parol noto'g'ri");
      } else {
        const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl');
        let destination = '/';
        if (
          callbackUrl?.startsWith('/') &&
          !callbackUrl.startsWith('//') &&
          !callbackUrl.startsWith('/\\')
        ) {
          const candidate = new URL(callbackUrl, window.location.origin);
          if (candidate.origin === window.location.origin) {
            destination = `${candidate.pathname}${candidate.search}${candidate.hash}`;
          }
        }
        router.push(destination);
        router.refresh();
      }
    } catch {
      setError('Tizimda xatolik yuz berdi');
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
        <Label htmlFor="email" className="text-gray-800 font-semibold text-sm ml-1">Email</Label>
        <div className="relative">
          <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input id="email" name="email" type="email" placeholder="sizning@email.com" required autoComplete="email" className={inputClass} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-gray-800 font-semibold text-sm ml-1">Parol</Label>
        <div className="relative">
          <Lock aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <Input id="password" name="password" type="password" placeholder="••••••••" required autoComplete="current-password" className={inputClass} />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 mt-4 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-xl disabled:opacity-50"
      >
        {loading ? 'Kirilmoqda...' : 'Kirish'}
      </Button>
    </form>
  );
}
