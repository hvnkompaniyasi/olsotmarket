import Link from 'next/link';
import { Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Kirish | Olsot Market',
  description: 'Olsot Market akkauntingizga kiring',
};

export default function LoginPage() {
  return (
    <Card className="relative w-full max-w-lg bg-white/70 backdrop-blur-2xl border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-[28px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-white/30 pointer-events-none" />
      <div className="relative p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-[0_8px_24px_rgba(10,124,78,0.35)]">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-600 bg-clip-text text-transparent">
            Olsot Market
          </h1>
          <p className="text-gray-700 mt-1 text-base font-medium">Akkauntingizga kiring</p>
        </div>
        <LoginForm />
        <div className="mt-3 text-center">
          <p className="text-gray-700 text-sm">
            Akkaunt yo&apos;qmi?{' '}
            <Link
              href="/register"
              className="text-green-600 hover:text-green-700 font-bold underline underline-offset-4"
            >
              Ro&apos;yxatdan o&apos;tish
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}
