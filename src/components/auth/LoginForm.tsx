'use client';

import { useRef, useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LoaderCircle, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/ui/PhoneInput';

type Method = 'phone' | 'email';
type Step = 'contact' | 'otp';
type OtpResponse = { error?: string; devCode?: string };

const inputClass = 'h-12 rounded-xl border-gray-200 bg-white text-gray-900 shadow-sm focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20';

export default function LoginForm() {
  const router = useRouter();
  const submissionInProgress = useRef(false);
  const [method, setMethod] = useState<Method>('phone');
  const [step, setStep] = useState<Step>('contact');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function selectMethod(nextMethod: Method) {
    setMethod(nextMethod);
    setStep('contact');
    setCode('');
    setDevCode('');
    setError('');
  }

  async function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(method === 'email' ? '/api/auth/send-email-otp' : '/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method === 'email' ? { email } : { phone }),
      });
      const result = (await response.json()) as OtpResponse;
      if (!response.ok) {
        setError(result.error || 'Kod yuborilmadi. Qayta urinib ko‘ring.');
        return;
      }
      setCode('');
      setDevCode(result.devCode || '');
      setStep('otp');
    } catch {
      setError('Aloqa xatosi. Qayta urinib ko‘ring.');
    } finally {
      setIsLoading(false);
      submissionInProgress.current = false;
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        ...(method === 'email' ? { email } : { phone }),
        code,
        redirect: false,
      });
      if (result?.error) {
        setError('Kod noto‘g‘ri yoki muddati tugagan.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setError('Tizimga kirishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
      submissionInProgress.current = false;
    }
  }

  return (
    <form onSubmit={step === 'contact' ? requestCode : verifyCode} className="space-y-4">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {step === 'contact' ? (
        <>
          <div role="tablist" aria-label="Kirish usuli" className="grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button type="button" role="tab" aria-selected={method === 'phone'} onClick={() => selectMethod('phone')} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${method === 'phone' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-600'}`}>
              <Phone aria-hidden="true" className="h-4 w-4" /> Telefon
            </button>
            <button type="button" role="tab" aria-selected={method === 'email'} onClick={() => selectMethod('email')} className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold ${method === 'email' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-600'}`}>
              <Mail aria-hidden="true" className="h-4 w-4" /> Email
            </button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-contact" className="ml-1 text-sm font-semibold text-gray-800">{method === 'phone' ? 'Telefon raqam' : 'Email manzili'}</Label>
            {method === 'phone' ? (
              <PhoneInput id="login-contact" value={phone || undefined} onChange={(value) => setPhone(value || '')} />
            ) : (
              <div className="relative">
                <Mail aria-hidden="true" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
                <Input id="login-contact" type="email" autoComplete="email" placeholder="email@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required className={`${inputClass} pl-11`} />
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <button type="button" onClick={() => { setStep('contact'); setCode(''); setError(''); }} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-800 hover:text-emerald-950">
            <ArrowLeft className="h-4 w-4" /> {method === 'phone' ? phone : email}
          </button>
          {devCode && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">Test kodi: {devCode}</p>}
          <div className="space-y-2">
            <Label htmlFor="login-code" className="ml-1 text-sm font-semibold text-gray-800">4 xonali tasdiqlash kodi</Label>
            <div className="relative">
              <ShieldCheck aria-hidden="true" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
              <Input id="login-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} placeholder="0000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 4))} required className={`${inputClass} pl-11 tracking-[0.3em]`} />
            </div>
            {error && <button type="button" disabled={isLoading} onClick={() => { void requestCode(); }} className="text-sm font-medium text-emerald-800 hover:text-emerald-950 disabled:opacity-60">Kodni qayta yuborish</button>}
          </div>
        </>
      )}
      <Button type="submit" disabled={isLoading || (step === 'otp' && code.length !== 4)} className="mt-2 h-12 w-full rounded-xl bg-emerald-700 font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
        {isLoading ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Kutilmoqda...</> : step === 'contact' ? 'Kod olish' : 'Kirish'}
      </Button>
    </form>
  );
}
