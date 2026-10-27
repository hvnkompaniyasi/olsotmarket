'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Step = 'phone' | 'otp';
type OtpResponse = { error?: string; devCode?: string };

const inputClass = 'h-12 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20';

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const result = (await response.json()) as OtpResponse;
      if (!response.ok) {
        setError(result.error || 'Kod yuborilmadi. Qayta urinib ko‘ring.');
        return;
      }
      setDevCode(result.devCode || '');
      setStep('otp');
    } catch {
      setError('Aloqa xatosi. Qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { phone, code, name, redirect: false });
      if (result?.error) {
        setError('Kod noto‘g‘ri yoki muddati tugagan.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Ro‘yxatdan o‘tishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={step === 'phone' ? requestCode : verifyCode} className="space-y-4">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="register-name" className="ml-1 text-sm font-semibold text-gray-800">Ism</Label>
            <div className="relative">
              <UserRound aria-hidden="true" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
              <Input id="register-name" autoComplete="name" placeholder="Ismingiz" value={name} onChange={(event) => setName(event.target.value)} required className={`${inputClass} pl-11`} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-phone" className="ml-1 text-sm font-semibold text-gray-800">Telefon raqam</Label>
            <div className="relative">
              <Phone aria-hidden="true" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
              <Input id="register-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" value={phone} onChange={(event) => setPhone(event.target.value)} required className={`${inputClass} pl-11`} />
            </div>
          </div>
        </>
      ) : (
        <>
          <button type="button" onClick={() => { setStep('phone'); setCode(''); setError(''); }} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-950">
            <ArrowLeft className="h-4 w-4" /> {phone}
          </button>
          {devCode && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Test kodi: {devCode}</p>}
          <div className="space-y-2">
            <Label htmlFor="register-code" className="ml-1 text-sm font-semibold text-gray-800">4 xonali tasdiqlash kodi</Label>
            <div className="relative">
              <ShieldCheck aria-hidden="true" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
              <Input id="register-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} placeholder="0000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))} required className={`${inputClass} pl-11 tracking-[0.3em]`} />
            </div>
          </div>
        </>
      )}
      <Button type="submit" disabled={loading || (step === 'otp' && code.length !== 4)} className="mt-2 h-12 w-full rounded-xl bg-emerald-700 font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
        {loading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Kutilmoqda...</> : step === 'phone' ? 'Kod olish' : 'Kirish'}
      </Button>
    </form>
  );
}
